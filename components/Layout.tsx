import Link from "next/link";
import Image from "next/image";
import styles from './css/layout.module.css';
import { NavBarItems } from "./NavBarItems";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserLock, faBars } from '@fortawesome/free-solid-svg-icons';


export default function Layout({ children }:{ children: any}) {
    const { data: session } = useSession();
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(true);

    function handleResize() {
        if (window.innerWidth < 768) {
            setIsOpen(false);
        } else {
            setIsOpen(true);
        }
    }

    useEffect(() => {
        handleResize();  
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <>
        <div className={styles.MainBody}>
            <div className={styles.HeaderContainer}> {/*Header*/}
                <div className={styles.HeaderRowContainer}>
                    <div className={styles.HeaderLogo}>
                        <div className={styles.HeaderLogoButton}>
                            <FontAwesomeIcon icon={faBars} size="2xl" onClick={() => {setIsOpen(!isOpen)}}/>
                        </div>
                        <Link href={"/"}>
                            <h1>{`${process.env.WebsiteName}`}</h1>
                        </Link>
                    </div>
                    <div className={styles.HeaderAccountButton}
                        onClick={() => {
                            if (session){
                                signOut({ callbackUrl: '/' });
                            } else {
                                router.push('/');
                            }
                        }}
                    >
                        {(session && session.user && session.user.image)
                        ? (<div style={{display: 'flex', position: 'relative', width: '100%', height: '100%'}}>
                            <Image src={session.user.image}
                            width={20} height={20}
                            alt='Profile Picture'
                            style={{objectFit:"contain", marginRight: '0.2rem'}}
                            />
                            <div className={styles.UserNameText}>
                                <span>{session.user.name}</span>
                            </div>
                        </div>)
                        : (<><FontAwesomeIcon icon={faUserLock}/> Sign in</>)
                        }
                    </div>
                </div>
            </div>
            <div className={styles.BodyContainer}> {/*Body container*/}
                <div className={styles.NavBarContainer}
                        style={{ display: isOpen ? 'block' : 'none' }}> {/*NavBar*/}
                    <div className={styles.NavBarList}>
                        {NavBarItems.map((menu, idx) => {
                            if (menu.permissionRequired.includes(session?.user?.role!))
                            return (
                                <Link href={menu.href} key={idx.toString()} className={styles.NavBarItem}>
                                    <div className={styles.NavBarItemChild1}>
                                        <FontAwesomeIcon icon={menu.icon} className={styles.NavBarItemChild1}/>
                                    </div>
                                    <div className={styles.NavBarItemChild2}>{menu.text}</div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
                <div className={styles.ContentContainer}> {/*Body*/}
                    {children}
                </div>
            </div>
            <div className={styles.FooterContainer}> {/*Footer*/}
                <center><p>Made with ❤ from Brian</p></center>
            </div>
        </div>
        </>
    );
}