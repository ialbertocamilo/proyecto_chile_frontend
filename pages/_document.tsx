import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
        <title>Ceela Company</title>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/images/proyecto-deuman-logo.png" type="image/x-icon" />
        <link rel="shortcut icon" href="/assets/images/proyecto-deuman-logo.png" type="image/x-icon" />
        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css?family=Outfit:400,400i,500,500i,700,700i&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Roboto:300,300i,400,400i,500,500i,700,700i,900&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" type="text/css" href="/assets/css/font-awesome.css" />
        <link rel="stylesheet" type="text/css" href="/assets/css/vendors/icofont.css" />
        <link rel="stylesheet" type="text/css" href="/assets/css/vendors/themify.css" />
        <link rel="stylesheet" type="text/css" href="/assets/css/vendors/flag-icon.css" />
        <link rel="stylesheet" type="text/css" href="/assets/css/vendors/feather-icon.css" />
        <link rel="stylesheet" type="text/css" href="/assets/css/vendors/sweetalert2.css" />
        <link rel="stylesheet" type="text/css" href="/assets/css/vendors/bootstrap.css" />
        <link rel="stylesheet" type="text/css" href="/assets/css/style.css" />
        <link id="color" rel="stylesheet" href="/assets/css/color-1.css" media="screen" />
        <link rel="stylesheet" type="text/css" href="/assets/css/responsive.css" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
