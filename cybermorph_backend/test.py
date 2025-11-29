from app.core.security import verify_password

hashed = "$2b$12$vLCvHH9W.Y61XDY900ABEu3c8gYlzBjsWQSf1i4hBCNBM5Rk7Sn0G"
print(verify_password("AdminPassword123", hashed))  # Replace with the password you typed in frontend
