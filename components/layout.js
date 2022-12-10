import Link from "next/link";
import styles from './css/layout.module.css';
import React, { useState } from "react";
import { NavBarItems } from "./NavBarItems";

const Header = () => {
    return (
        <>
        <div className={styles.HeaderRow}>
            <i className={`fa-solid fa-bars fa-2xl ${styles.FAIcon}`}
                onClick={() => {
                    if (window.screen.width <= 1000 && document.getElementById('nav-bar-container').style.display == ''){
                        document.getElementById('nav-bar-container').style.display = 'block';
                    } else if (window.screen.width > 1000 && document.getElementById('nav-bar-container').style.display == ''){
                        document.getElementById('nav-bar-container').style.display = 'none';
                    } else {
                        document.getElementById('nav-bar-container').style.display = document.getElementById('nav-bar-container').style.display == 'none' ? 'block' : 'none';
                    }
                }}
            ></i>
            <Link href={"/"}>
                <h1>{process.env.websiteName}</h1>
            </Link>
        </div>
        </>
    );
};

const Footer = () => {
    return (
        <>
        <center><p>Made with ❤ from Brian</p></center>
        </>
    );
};

const Navbar = () => {
    const [navActive, setNavActive] = useState(null);
    const [activeIdx, setActiveIdx] = useState(-1);
  
    return (
      <>
        <div>
            <div onClick={() => setNavActive(!navActive)}></div>
            <div className={`${navActive ? "NavBarActive" : ""} ${styles.NavBarList}`}>
                {NavBarItems.map((menu, idx) => (
                    <div onClick={() => { setActiveIdx(idx); setNavActive(false); }} key={menu.text} >
                    <Link href={menu.href}>
                        <div className={`${styles.NavBarItem} ${ navActive ? "NavBarActive" : "" }`}>{menu.text}</div>
                    </Link>
                    </div>
                ))}
            </div>
        </div>
      </>
    );
};

export default function Layout({ children }) {
    return (
        <>
        <div className={styles.MainBody}>
            <div className={styles.HeaderContainer}><Header /></div>
            <div className={styles.BodyContainer}>
                <div className={styles.NavBarContainer} id={`nav-bar-container`}><Navbar /></div>
                <div className={styles.ContentContainer} id={`content-container`}>{children}</div>
            </div>
            <div className={styles.FooterContainer}><Footer /></div>
        </div>
        </>
    );
}