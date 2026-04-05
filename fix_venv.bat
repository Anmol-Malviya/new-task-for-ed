@echo off
echo Deleting broken .venv...
rmdir /s /q backend\.venv

echo Recreating .venv...
cd backend
python -m venv .venv

echo Installing dependencies...
call .venv\Scripts\activate.bat
pip install -r requirements.txt

echo Applying migrations...
python manage.py migrate

echo Done! Now you can run run.bat again.
pause
