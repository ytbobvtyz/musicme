import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException
from typing import Optional

class FileStorage:
    def __init__(self, base_upload_dir: str = "uploads"):
        self.base_upload_dir = base_upload_dir
        self.audio_dir = os.path.join(base_upload_dir, "audio")
        self.examples_dir = os.path.join(base_upload_dir, "examples")
        
        # Создаем директории при инициализации
        os.makedirs(self.audio_dir, exist_ok=True)
        os.makedirs(self.examples_dir, exist_ok=True)
    
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

# Создаем глобальный экземпляр
file_storage = FileStorage()