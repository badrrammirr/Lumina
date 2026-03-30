
import requests

url = "http://127.0.0.1:8000/upload_pdf"
pdf_path = r"C:\Users\ACER\Desktop\Work-Based\Backend\pdfs\section 4.pdf"

with open(pdf_path, "rb") as f:
    files = {"file": f}
    response = requests.post(url, files=files)

try:
    print(response.json())
except Exception as e:
    print("Response content:", response.text)
    print("Error parsing JSON:", e)