# Database Schema

## Таблица users
- id UUID PRIMARY KEY
- email VARCHAR UNIQUE NOT NULL
- name VARCHAR
- avatar_url VARCHAR
- created_at TIMESTAMP

## Таблица orders  
- id UUID PRIMARY KEY
- user_id UUID REFERENCES users(id)
- theme VARCHAR NOT NULL
- genre VARCHAR NOT NULL
- recipient_name VARCHAR NOT NULL
- status ORDER_STATUS NOT NULL
- interview_link VARCHAR
- created_at TIMESTAMP