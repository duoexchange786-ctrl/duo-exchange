"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState("");

  useEffect(() => {
    const now = new Date();
    const options = { day: "numeric", month: "long" };
    setToday(now.toLocaleDateString("en-GB", options));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          return;
        }
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="page-wrappers">
        <div className="loader">
          <Image
            src="/images/loading.webp"
            alt="loader"
            width={50}
            height={50}
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <main>
        <div className="page-wrappers page-wrapper-ex home-wrappers fullheight">
          <header className="header" style={{ position: "relative" }}>
            <div className="left"></div>
            <div className="right">
              { /* <img src="image/24-hours-support.png" /> */}
              <a href="https://t.me/duoexchange">
                <Image
                  src="/image/customer-care-icon1.png"
                  alt="customer"
                  width={24}
                  height={24}
                  priority
                /></a>

              <Link className='setting' href="/setting">
                <Image
                  src="/image/settings.png"
                  alt="setting"
                  width={24}
                  height={24}
                  priority
                /></Link>
            </div>
          </header>
          <div className="page-wrapper page-wrapper-ex">
            <section className="section-1">
              <div className="userpro">
                <div className="pic">
                  <img src="image/user-pic1.png" />
                </div>
                <h3>{user?.mobile ? `+91 ${user.mobile}` : "+91 ******"}</h3>
              </div>

              {user ? (
                <div className="tab-inl">
                  <div className="bx">
                    <p>Available <br /> Balance</p>
                    <h3>{(user?.wallet?.available || 0).toFixed(2)}</h3>
                  </div>
                  <div className="bx">
                    <p>Sell <br /> Pending </p>
                    <h3>{(user?.wallet?.sellPending || 0).toFixed(2)}</h3>
                  </div>
                  <div className="bx">
                    <p>Deposit <br /> Pending </p>
                    <h3>{(user?.wallet?.depositPending || 0).toFixed(2)}</h3>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="section-2a">
              <div className="inside">
                <div className="top">
                  <div className="lefts">
                    <div className="lf">
                      <img src="image/xicon1.png" />
                    </div>
                    <div className="rf">
                      <p className="ttl">
                        <b>0 PAYX</b>
                      </p>
                      <p>
                        <span>1PAYX = 0.010750 USDT</span>
                        <img src="images/ques.png" className="inq" />
                      </p>
                    </div>
                  </div>
                  <Link href="/exchange">
                    <div className="rights">
                      <button className="btn">Withdraw</button>
                    </div>
                  </Link>
                </div>
                <div className="btm">
                  {user ? null : (
                    <Link href="/login">
                      <button className="btn">Sign Up / Login</button>
                    </Link>
                  )}
                </div>
              </div>
            </section>

            <section className="section-3">
              <div className="inside">
                <div className="lefts">
                  <p className="ttl">Exchange</p>
                  <p>
                    <b>${(user?.wallet?.withdrawn || 0).toFixed(2)}</b>
                  </p>
                </div>
                <div className="mid">
                  <p className="ttl">
                    Reward <img src="image/xicon1.png" />
                  </p>
                  <p>
                    <b>0</b>
                  </p>
                </div>
                <div className="rights">
                  <button className="btn">Details</button>
                  <p>{today}</p>
                </div>
              </div>
            </section>

            <section className="section-2 reffer">
              <div className="rw">
                <div className="bx">
                  <Link href="/referals">
                    <div className="image">
                      <h3>
                        <img src="image/ref-icon1.png" /> Referrals
                      </h3>
                    </div>
                    <div className="arw">
                      <img src="images/right-arw.png" />
                    </div>
                  </Link>
                </div>
                <div className="bx">
                  <Link href="/history">
                    <div className="image">
                      <h3>
                        <img src="image/ref-icon2.png" /> Exchange History
                      </h3>
                    </div>
                    <div className="arw">
                      <img src="images/right-arw.png" />
                    </div>
                  </Link>
                </div>
                <div className="bx">
                  <Link href="/statements">
                    <div className="image">
                      <h3>
                        <img src="image/ref-icon3.png" /> Statement
                      </h3>
                    </div>
                    <div className="arw">
                      <img src="images/right-arw.png" />
                    </div>
                  </Link>
                </div>
                <div className="bx">
                  <Link href="/bank">
                    <div className="image">
                      <h3>
                        <img src="image/ref-icon4.png" /> Bank Account
                      </h3>
                    </div>
                    <div className="arw">
                      <img src="images/right-arw.png" />
                    </div>
                  </Link>
                </div>
                <div className="bx">
                  <Link href="/invite">
                    <div className="image">
                      <h3>
                        <img src="image/ref-icon5.png" /> Invited Friends
                      </h3>
                    </div>
                    <div className="arw">
                      <img src="images/right-arw.png" />
                    </div>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}



