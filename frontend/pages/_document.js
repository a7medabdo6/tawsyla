import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <body cz-shortcut-listen="true">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
