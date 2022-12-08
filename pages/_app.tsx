import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '../components/layout';
import Script from "next/script";

export default function App({ Component, pageProps }: AppProps) {
  return (
      <Layout>
        <Script src="https://kit.fontawesome.com/79d48c8813.js" />
        <Component {...pageProps} />
      </Layout>
  );
};
