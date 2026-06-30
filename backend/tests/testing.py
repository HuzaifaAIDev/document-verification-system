from database import SessionLocal
from models import User

db = SessionLocal()
u = db.query(User).filter(User.email=="muhammadhuzaifawd1st@gmail.com").first()

print(u.otp_expiry)
print(type(u.otp_expiry))
print(u.otp_expiry.tzinfo)