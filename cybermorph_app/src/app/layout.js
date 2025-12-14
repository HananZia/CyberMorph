import { AuthProvider } from "../context/AuthContext";

import Header from "../components/header";

import Footer from "../components/footer";

import './layout.css'; // Import the new global layout CSS

import '../components/header.css'; // Import styles for Header/Footer

import '../components/footer.css'; // Import styles for Header/Footer



export const metadata = {

  title: "CyberMorph",

  description: "AI Antivirus & Malware Detection",

};



export default function RootLayout({ children }) {

  return (

    <html lang="en">

      {/* Updated body class to light theme base */}

      <body className="light-theme-body">

        <AuthProvider>

          <div className="app-wrapper">

            <Header />

            <main className="main-content">

              {children}

            </main>

            <Footer />

          </div>

        </AuthProvider>

      </body>

    </html>

  );

}