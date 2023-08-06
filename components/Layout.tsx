'use client';

import Link from "next/link";
import styles from '@components/css/layout.module.css';
import { NavBarItems } from "./NavBarItems";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faBars } from '@fortawesome/free-solid-svg-icons';


export default function Layout({ children }:{ children: any}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(true);
    const [isHiddenContent, setIsHiddenContent] = useState(false);

    const [displayName, setDisplayName] = useState(session?.user?.name);

    function handleResize() {
        setIsHiddenContent(false);
        if (window.innerWidth < 768) {
            setIsOpen(false);
        } else {
            setIsOpen(true);
        }
    }

    useEffect(() => {
        if (status === "authenticated") {
            setDisplayName(`Logged in as ${session?.user?.name}`);
        }
        handleResize();  
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [status]);

    return (
        <>
        <div className={styles.MainBody}>
            <div className={styles.HeaderContainer}>
                <div className={styles.HeaderNavMenuButton}>
                    <FontAwesomeIcon icon={faBars} size="2xl"
                        onClick={() => {
                            setIsOpen(!isOpen);
                            if (window.innerWidth < 768){
                                (isOpen) ? setIsHiddenContent(false) : setIsHiddenContent(true);
                            }
                        }}/>
                </div>
                <Link href={"/"}>
                    <h2>{`${process.env.WebsiteName}`}</h2>
                </Link>
            </div>
            <div style={{display: "flex"}}>
                <div className={styles.NavContainer}
                    style={{display: (session && session.user && isOpen) ? 'flex' : 'none'}}
                > {/* NavBar */}
                    {NavBarItems.map((menu, idx) => {
                        if (menu.permissionRequired.includes((session?.user?.role!)?session?.user?.role!:''))
                        return (
                            <Link href={menu.href}
                                key={idx.toString()}
                                className={`${styles.NavBarItem} ${(router.asPath.split("/", 2).join("/") === menu.href) ? styles.NavBarItemActive : ''}`}
                                onClick={() => {
                                    if (window.innerWidth < 768) {
                                        setIsOpen(false);
                                    }
                                    setIsHiddenContent(false);
                                }}
                            >
                                <div style={{width: '30px'}}>
                                    <FontAwesomeIcon icon={menu.icon}/>
                                </div>
                                <div className={styles.NavBarItemText}>{menu.text}</div>
                            </Link>
                        );
                    })}
                    <div
                        className={`${styles.NavBarItem} ${styles.AccountButton}`}
                        onClick={() => {
                            if (session){
                                signOut({ callbackUrl: '/' });
                            } else {
                                router.push('/');
                            }
                        }}
                        onMouseEnter={() => setDisplayName('Sign Out')}
                        onMouseLeave={() => setDisplayName(`Logged in as ${session?.user?.name}`)}
                        > {/* Account Button */}

                        <div style={{width: '30px'}}>
                            <FontAwesomeIcon icon={faArrowRightFromBracket}/>
                        </div>
                        <div className={styles.NavBarItemText}>{displayName}</div>
                    </div>
                </div>
                <div className={styles.BodyContainer} style={{ display: isHiddenContent ? 'none' : 'block' }}> {/*Body container*/}
                    {children}
                </div>
            </div>
            <div className={styles.FooterContainer}> {/* Footer */}
                <p>&copy; {new Date().getFullYear()} Daydream Technology. All rights reserved.</p>
            </div>
        </div>
        </>
    );
}