import '../styles/globals.css'
import '@components/css/nprogress.css';

import type { AppProps } from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import { SessionProvider } from "next-auth/react";
import NProgress from 'nprogress';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '@components/Layout';
import RouteGuard from '@components/RouteGuard';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function App({ Component, pageProps, router }: AppProps) {
  return (
      <SessionProvider session={pageProps.session}>
        <RouteGuard router={router}>
          <Layout>
            <Head>
                <link rel="icon" href="https://staffmanagement.daydreamtech.net/favicon.ico" />
            </Head>
            <Component {...pageProps} />
            <ToastContainer limit={3} />
          </Layout>
        </RouteGuard>
      </SessionProvider>
  );
};
