import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException
from typing import Optional
from mutagen import File
from mutagen.id3 import ID3
import tempfile
from fastapi.responses import Response

class FileStorage:
    def __init__(self, base_upload_dir: str = "uploads"):
        self.base_upload_dir = base_upload_dir
        self.audio_dir = os.path.join(base_upload_dir, "audio")
        self.examples_dir = os.path.join(base_upload_dir, "examples")
        self.covers_dir = os.path.join(base_upload_dir, "covers")

        # Создаем директории при инициализации
        os.makedirs(self.audio_dir, exist_ok=True)
        os.makedirs(self.examples_dir, exist_ok=True)
        os.makedirs(self.covers_dir, exist_ok=True)

    async def save_audio_file(self, file: UploadFile, subdirectory: str = "audio") -> dict:
        """Сохранить аудио файл и вернуть метаданные"""
        # Проверяем тип файла
        if not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="Файл должен быть аудио")
        
        # Определяем директорию для сохранения
        if subdirectory == "examples":
            save_dir = self.examples_dir
        else:
            save_dir = self.audio_dir
        
        # Генерируем уникальное имя файла
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(save_dir, filename)
        
        # Сохраняем файл
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "filename": filename,
            "original_name": file.filename,
            "file_path": file_path,
            "size": os.path.getsize(file_path),
            "mimetype": file.content_type
        }
    
    def get_file_path(self, filename: str, subdirectory: str = "audio") -> Optional[str]:
        """Получить путь к файлу"""
        if subdirectory == "examples":
            directory = self.examples_dir
        else:
            directory = self.audio_dir
        
        file_path = os.path.join(directory, filename)
        return file_path if os.path.exists(file_path) else None
    
    def delete_file(self, filename: str, subdirectory: str = "audio") -> bool:
        """Удалить файл"""
        try:
            file_path = self.get_file_path(filename, subdirectory)
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
                print(f"File deleted successfully: {file_path}")
                return True
            else:
                print(f"File not found: {filename} in {subdirectory}")
                return False
        except Exception as e:
            print(f"Error deleting file {filename}: {e}")
            return False

    def extract_cover_from_mp3(self, audio_filename: str, subdirectory: str = "audio") -> Optional[str]:
        """Извлечь обложку из MP3 файла и сохранить её"""
        try:
            audio_path = self.get_file_path(audio_filename, subdirectory)
            if not audio_path:
                return None
            
            # Загружаем метаданные MP3
            audio = File(audio_path)
            if audio is None:
                return None
            
            # Ищем обложку в тегах
            cover_data = None
            cover_mimetype = "image/jpeg"
            
            if hasattr(audio, 'tags'):
                # Для ID3 тегов (стандартные MP3)
                if audio.tags:
                    for key in audio.tags.keys():
                        if 'APIC' in key or 'covr' in key:
                            cover_data = audio.tags[key].data
                            if hasattr(audio.tags[key], 'mime'):
                                cover_mimetype = audio.tags[key].mime
                            break
            
            # Альтернативный способ для некоторых форматов
            if not cover_data and hasattr(audio, 'pictures'):
                if audio.pictures:
                    cover_data = audio.pictures[0].data
                    cover_mimetype = audio.pictures[0].mime
            
            if not cover_data:
                return None
            
            # Сохраняем обложку
            cover_extension = ".jpg" if "jpeg" in cover_mimetype else ".png"
            cover_filename = f"{os.path.splitext(audio_filename)[0]}_cover{cover_extension}"
            cover_path = os.path.join(self.covers_dir, cover_filename)
            
            with open(cover_path, "wb") as f:
                f.write(cover_data)
            
            return cover_filename
            
        except Exception as e:
            print(f"Error extracting cover from {audio_filename}: {e}")
            return None
    
    def get_cover_path(self, cover_filename: str) -> Optional[str]:
        """Получить путь к файлу обложки"""
        cover_path = os.path.join(self.covers_dir, cover_filename)
        return cover_path if os.path.exists(cover_path) else None
    
    def get_or_create_cover(self, audio_filename: str, subdirectory: str = "audio") -> Optional[str]:
        """Получить обложку, если есть, или создать из MP3"""
        # Сначала ищем существующую обложку
        expected_cover_name = f"{os.path.splitext(audio_filename)[0]}_cover.jpg"
        existing_cover = self.get_cover_path(expected_cover_name)
        
        if existing_cover:
            return expected_cover_name
        
        # Если нет, извлекаем из MP3
        return self.extract_cover_from_mp3(audio_filename, subdirectory)
# Создаем глобальный экземпляр
file_storage = FileStorage()