'use client'
//import Image from "next/image";
import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
    const [activeTab, setActiveTab] = useState('home');
  return (
    <div>
      <main >        
        <footer className="footer">
            <div className="bx">
                <Link href="/" className={`tb ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
                <div className="icon">
                    <img src="images/l-home.png" className="noact" />
                    <img src="images/d-home.png" className="act" />
                </div>
                <p>Home</p>
                </Link>
            </div>
            <div className="bx">
                <Link href="/exchange" className={`tb ${activeTab === 'exchange' ? 'active' : ''}`}
          onClick={() => setActiveTab('exchange')}>
                <div className="icon">
                    <img src="images/l-exchange.png" className="noact" />
                    <img src="images/d-exchange.png" className="act" />
                </div>
                <p>Exchange</p>
                </Link>
            </div>
            <div className="bx">
                <Link href="/login" className={`tb ${activeTab === 'mine' ? 'active' : ''}`}
          onClick={() => setActiveTab('mine')}>
                <div className="icon">
                    <img src="images/l-mine.png" className="noact" />
                    <img src="images/d-mine.png" className="act" />
                </div>
                <p>Mine</p>
                </Link>
            </div>
            </footer>
      </main>  
</div>
      
  )
}