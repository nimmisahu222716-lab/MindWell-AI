from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)

password = "Nimmi123"

hashed = hash_password(password)

print("Original :", password)
print("Hashed   :", hashed)

print(
    verify_password(
        password,
        hashed
    )
)

token = create_access_token(
    {"email": "test@gmail.com"}
)

print(token)