'use client'
import React from 'react';

//import Image from "next/image";
import Link from 'next/link';
import Footer from '../components/footer';


export default function DemoPage() {
  
  return (
    <div>
      <main>
        <div className="page-wrappers empty-page">

  <div className="page-wrapperss page-wrapper-ex page-wrapper-login page-wrapper-loginacc form-wrapper">
    <div className="brdc">
      <div className="back-btn">
        <Link href="/home">
          <img src="images/back-btn.png" />
        </Link>
      </div>
      <h3>Page Title</h3>
    </div>
    <section className="section-1">
      <div className="image">
        <img src="images/empty.jpg" />
      </div>
    </section>
  </div>
</div>

<Footer></Footer>

      </main>    
    </div>
  );
}
