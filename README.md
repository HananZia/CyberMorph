# CyberMorph

**AI-Based Antivirus and Malware Detection & Prevention System**

CyberMorph is an advanced AI-powered cybersecurity solution designed to detect, prevent, and remove malware and other malicious threats in real-time. It leverages machine learning algorithms to analyze files and system behavior, providing proactive protection against viruses, malware, and ransomware.

---

## Features

- **AI-Powered Malware Detection:** Uses machine learning models to identify malicious files and suspicious activity.
- **Real-Time Threat Prevention:** Monitors system activities continuously to prevent infections before they spread.
- **Cross-Platform Support:** Compatible with major operating systems.
- **User-Friendly Interface:** Simple and intuitive application interface for easy interaction.
- **Modular Architecture:** Structured backend and frontend for scalability and easy maintenance.

---

## Project Structure

```
CyberMorph/
│
├─ agent/                 # Core agent for scanning and system monitoring
├─ cybermorph_app/        # Frontend application files (UI)
├─ cybermorph_backend/    # Backend API and AI models
├─ .env                   # Environment configuration
├─ package.json           # Node.js dependencies and scripts
├─ package-lock.json
├─ LICENSE                # License information
└─ README.md              # Project documentation
```

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/HananZia/CyberMorph.git
cd CyberMorph
```

2. Install backend dependencies:

```bash
cd cybermorph_backend
pip install -r requirements.txt
```

3. Install frontend dependencies:

```bash
cd ../cybermorph_app
npm install
```

4. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your settings
```

---

## Usage

### Start Backend:

```bash
cd cybermorph_backend
uvicorn app.main:app --reload
```

### Start Frontend:

```bash
cd cybermorph_app
npm run dev
```

### Run Agent:

```bash
cd agent
python agent.py
```

Once running, CyberMorph will continuously monitor your system and alert you about any threats.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-name`)
3. Make your changes
4. Commit your changes (`git commit -m "Add new feature"`)
5. Push to the branch (`git push origin feature-name`)
6. Create a Pull Request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

- **Author:** Muhammad Hanan Zia
- **GitHub:** [HananZia](https://github.com/HananZia)
- **Email:** hananzia477@gmail.com