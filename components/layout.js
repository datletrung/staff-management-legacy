import Link from "next/link";
import Image from "next/image";
import styles from './css/layout.module.css';
import { NavBarItems } from "./NavBarItems";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from 'next/router';

export default function Layout({ children }) {
    const { data: session } = useSession();
    const router = useRouter();
    return (
        <>
        <div className={styles.MainBody}>
            <div className={styles.HeaderContainer}> {/*Header*/}
                <div className={styles.HeaderRowContainer}>
                    <div className={styles.HeaderLogo}>
                        <i className={`fa-solid fa-bars fa-2xl ${styles.FAIcon}`}
                            onClick={() => {/*handle Show/Hide NavBar*/ return }}
                        ></i>
                        <Link href={"/"}>
                            <h1>{`${process.env.websiteName}`}</h1>
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
                        {(session)
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
                        : (<><i className='fa-solid fa-user-lock'></i> Sign in</>)
                        }
                    </div>
                </div>
            </div>
            <div className={styles.BodyContainer}> {/*Body container*/}
                <div className={styles.NavBarContainer}> {/*NavBar*/}
                    <div className={styles.NavBarList}>
                        {NavBarItems.map((menu, idx) => (
                            <Link href={menu.href} key={idx.toString()} className={styles.NavBarItem}>
                                <i className={menu.icon}></i>{' '}{menu.text}
                            </Link>
                        ))}
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