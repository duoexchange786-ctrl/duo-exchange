'use client'
import React, { useEffect, useState } from 'react';
import Image from "next/image";
import Link from 'next/link';

//import Slider from "react-slick";

//import "slick-carousel/slick/slick.css";
//import "slick-carousel/slick/slick-theme.css";

import Footer from './components/footer';

/*const settings = {
   dots: false,
   arrows: false,
   autoplay: true,
   infinite: true,
   speed: 800,
   slidesToShow: 1,
   slidesToScroll: 1,
   variableWidth: false,
 };

 const settings1 = {
   vertical: true,
   arrows: false,
   autoplay: true,
   autoplaySpeed: 3500,
   speed: 800,
   infinite: true,
   pauseOnHover: false,
 };*/

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthChecking(false);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (e) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setAuthChecking(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const [showAppLink, setShowAppLink] = useState(true);

  return (
    <div>
      <div className="page-wrappers" style={{ background: '#f9f9f9', height: '110vh' }}>

        {(loading || authChecking) && <div className="loader">
          <Image
            src="/images/loading.webp"
            alt="loader"
            width={50}
            height={50}
            priority
          />
        </div>}


        {showAppLink && (
          <div className="applinkMainDiv">
            <div className="applinkdownload">
              <div className="appimgtext">
                <img src="/image/applinkimg.png" alt="duoexchange" />
                <div className="textlink">
                  <h4>duoexchange </h4>
                  <p>India’s #1 Trusted USDT Exchange Platform.</p>
                </div>
              </div>

              <Link
                href="duoexchange.apk"
                className="downloadbutton"
                download
              >
                Download
              </Link>
            </div>

            <button
              className="closeAppLink"
              onClick={() => setShowAppLink(false)}
            >
              X
            </button>
          </div>
        )}

        <header className="header" style={{ position: 'relative' }}>
          <div className="left">
            <div className="logo-icon">
              <Image
                src="/image/applink-icon.png"
                alt="logo"
                width={50}
                height={44}
                priority
              />
            </div>
            <div className="logo-text"><p>duoexchange </p></div>
          </div>
          <div className="right">
            {/* <Link href="#">
                <Image                
                src="/image/bell.png"
                alt="notification"
                width={24}
                height={24}
                priority
                /></Link> */}
            <Link href="https://t.me/duoexchange" style={{ marginLeft: "10px" }}>
              <Image
                src="/image/customer-care-icon.png"
                alt="earphone"
                width={24}
                height={24}
                priority
              /></Link>
          </div>
        </header>

        <div className="page-wrapper" style={{ paddingTop: '10px' }}>
          {user && (
            <div className="ifLoginMainDe">
              <div className="inner">
                <span className="labelTxtMain"><b>Available Balance</b></span>
                <p style={{ fontSize: '14px' }}>
                  <span style={{ fontSize: 16, fontWeight: "600 !important" }} />  {(user.wallet?.available || 0).toFixed(2)} USDT
                </p>
              </div>
              <div className="mainTwoInDiv">
                <div style={{ width: "50%" }}>
                  <span className="labelTxtMain"><b>Sell Pending</b></span>
                  <p>
                    <span /> {(user.wallet?.sellPending || 0).toFixed(2)} USDT
                  </p>
                </div>
                <div style={{ width: "50%" }}>
                  <span className="labelTxtMain"><b>Deposit Pending</b></span>
                  <p>
                    <span /> {(user.wallet?.depositPending || 0).toFixed(2)} USDT
                  </p>
                </div>
              </div>
              <img src="/image/wallet.png" alt="" />
            </div>
          )}

          {!user && !authChecking && (
            <div className="easyTradingSection">
              <div className="texteasy">
                <h2>Easy trading quick profits</h2>
                <p>Ensuring every user maximizer their <br /> investment return</p>
                <Link href="/login">
                  <button>Sign up <i className="bi bi-arrow-right-short"></i></button>
                </Link>
              </div>
              <img src="/image/main_image.png" />
            </div>
          )}

          <div className="threeSection">
            <div className="">
              <Link href="/USDT-deposit">
                <img src="/image/deposit.png" alt="" />
                <p>Deposit</p>
              </Link>
            </div>
            <div className="">
              <Link href="/exchange">
                <img src="/image/withdraw.png" alt="" />
                <p>Sell USDT</p>
              </Link>
            </div>
            <div className="">
              <Link href="/bank">
                <img src="/image/bankcard.png" alt="" />
                <p>Add Bank A/C</p>
              </Link>
            </div>


          </div>
          {/*<div className="price-calc">
            
                
                <div className="notify">
                  <div className="lefts">
                    <div className="icon">
                      <img src="images/notify.png" />
                    </div>
                    <div className="spr">|</div>
                    <Slider {...settings1} className="text-sl">
                      <p className="text">
                        <span className="time">12:34</span> 84***4556 solid for
                        $756
                      </p>
                      <p className="text">
                        <span className="time">10:55</span> 84***6744 solid for
                        $897
                      </p>
                    </Slider>
                  </div>
                  <div className="rights">
                    <div className="icon right">
                      <img src="images/right-arw.png" />
                    </div>
                  </div>
                </div>
              </div> */}
          <div className="threeSectionSlider">
            <div>
              <span>ETH USDT</span>
              <h3>1.2491</h3>
              <p>+2.29%</p>
            </div>
            <div>
              <span>BTC USDT</span>
              <h3>1.1891</h3>
              <p>+1.72%</p>
            </div>
            <div>
              <span>USD USDT</span>
              <h3>1.0003</h3>
              <p>+0.11%</p>
            </div>
          </div>

          <div className="twoLastSec">
            <div className="lefttwo">
              <div className="logo-text"><p>duoexchange </p></div>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: "#01ba8e",
                  lineHeight: '23px',
                  marginBottom: 0
                }}
              >
                Invite your <br /> friends
              </h2>
              <p style={{ fontSize: '11px', fontWeight: 400, color: "#4b4b4b", lineHeight: '150%' }}>
                Earn your commissons
              </p>
              <Link href="/invite"><img src="/image/right.png" alt="" style={{ width: '40px', marginTop: '5px' }} /></Link>
              <div className="coimmico"><img src="/image/comm.png" alt="" style={{ width: '90px' }} /></div>
            </div>
            <div className="righttwo">
              <div className="bttright">
                <img src="/image/ex__t.png" alt="" />
              </div>
              <div className="btright">
                <h2
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    marginBottom: "2px !important"
                  }}
                >
                  Make money <img src="/image/right_w.png" />
                </h2>
                <p style={{ fontSize: '11px', color: "#666" }}>
                  together with duoexchange <br />
                </p>
              </div>
            </div>
          </div>




        </div>

        <Footer></Footer>
      </div>
    </div>
  );
}





