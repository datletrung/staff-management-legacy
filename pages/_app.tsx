import '../styles/globals.css'
import './css/nprogress.css';
import type { AppProps } from 'next/app'
import Script from 'next/script';
import Router from 'next/router';
import { SessionProvider } from "next-auth/react";

import NProgress from 'nprogress';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from '../components/Layout';
import RouteGuard from '../components/RouteGuard';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function App({ Component, pageProps, router }: AppProps) {
  return (
      <SessionProvider session={pageProps.session}>
        <RouteGuard router={router}>
          <Layout>
            <Script src="https://kit.fontawesome.com/79d48c8813.js" />
            <Component {...pageProps} />
            <ToastContainer limit={3} />
          </Layout>
        </RouteGuard>
      </SessionProvider>
  );
};
