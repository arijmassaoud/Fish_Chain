// frontend/src/app/privacy/page.tsx
import React from 'react';
import Head from 'next/head';

export default function PrivacyPolicyPage() {
  return (
    <div style={styles.container}>
      <Head>
        <title>FishChain - Privacy Policy</title>
        <meta name="description" content="Our Privacy Policy at FishChain. Learn how we collect, use, and protect your personal data." />
      </Head>

      <h1 style={styles.heading}>FishChain Privacy Policy</h1>
      <p style={styles.lastUpdated}>Last Updated: June 10, 2025</p>

      <p style={styles.paragraph}>
        Welcome to FishChain! We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how FishChain (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) collects, uses, discloses, and protects your information when you visit our website at [Your Website URL], use our services, or interact with us.
      </p>
      <p style={styles.paragraph}>
        By accessing or using our services, you agree to the terms of this Privacy Policy.
      </p>

      <h2 style={styles.subHeading}>1. Information We Collect</h2>
      <p style={styles.paragraph}>
        We collect various types of information to provide and improve our services to you, including:
      </p>
      <ul style={styles.list}>
        <li>
          **Personal Identifiable Information (PII):** This includes information you voluntarily provide when you create an account, place an order, subscribe to our newsletter, or contact us. Examples include your name, email address, phone number, shipping address, billing address, and payment information.
        </li>
        <li>
          **Transactional Data:** Details about your purchases, orders, and products you&apos;ve acquired through FishChain.
        </li>
        <li>
          **Usage Data:** Information about how you access and use our website, such as your IP address, browser type, operating system, pages visited, time spent on pages, referral sources, and interaction with our AI chat or FAQ features.
        </li>
        <li>
          **Device Information:** Information about the device you use to access our services, including hardware model, operating system, and unique device identifiers.
        </li>
        <li>
          **Traceability Data (Non-Personal):** While not directly personal, we collect and display data related to the origin and journey of fish products (e.g., catch date, farm location, certifications) which is linked via our blockchain system. This data is associated with products, not individuals.
        </li>
        <li>
          **Communications Data:** Records of your communications with us, including emails, chat transcripts (from your chat assistance), and feedback.
        </li>
      </ul>

      <h2 style={styles.subHeading}>2. How We Use Your Information</h2>
      <p style={styles.paragraph}>
        We use the collected information for various purposes, including:
      </p>
      <ul style={styles.list}>
        <li>To provide and maintain our services, including processing your orders and deliveries.</li>
        <li>To manage your account and provide customer support.</li>
        <li>To improve and personalize your experience on FishChain.</li>
        <li>To communicate with you about your orders, products, services, and promotions.</li>
        <li>To monitor and analyze usage and trends to improve our website&apos;s functionality and content.</li>
        <li>To ensure the security and integrity of our services.</li>
        <li>To comply with legal obligations and enforce our terms and conditions.</li>
        <li>To facilitate the blockchain traceability of your purchased fish products.</li>
        <li>To generate AI-powered responses for product descriptions, category descriptions, news topics, blog posts, smart replies, and FAQ answers, based on your inputs.</li>
      </ul>

      <h2 style={styles.subHeading}>3. How We Share Your Information</h2>
      <p style={styles.paragraph}>
        We may share your information with third parties in the following situations:
      </p>
      <ul style={styles.list}>
        <li>
          **Service Providers:** We may share your data with third-party vendors and service providers who perform services on our behalf, such as payment processing, delivery logistics, website hosting, data analysis, and marketing assistance. These providers are obligated to protect your information.
        </li>
        <li>
          **Business Transfers:** In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company.
        </li>
        <li>
          **Legal Requirements:** We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court order or government agency).
        </li>
        <li>
          **With Your Consent:** We may share your information with your explicit consent.
        </li>
        <li>
          **Aggregated or Anonymized Data:** We may share aggregated or de-identified information that cannot reasonably be used to identify you.
        </li>
      </ul>

      <h2 style={styles.subHeading}>4. Data Security</h2>
      <p style={styles.paragraph}>
        We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information. These measures include using secure servers, encryption (SSL technology), and access controls. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
      </p>

      <h2 style={styles.subHeading}>5. Your Data Protection Rights</h2>
      <p style={styles.paragraph}>
        Depending on your location and applicable laws (e.g., Tunisian data protection regulations), you may have the following rights regarding your personal data:
      </p>
      <ul style={styles.list}>
        <li>The right to access your personal data.</li>
        <li>The right to rectify inaccurate data.</li>
        <li>The right to request erasure of your data.</li>
        <li>The right to restrict processing of your data.</li>
        <li>The right to data portability.</li>
        <li>The right to object to processing.</li>
        <li>The right to withdraw consent (where consent is the basis for processing).</li>
      </ul>
      <p style={styles.paragraph}>
        To exercise any of these rights, please contact us using the details provided below.
      </p>

      <h2 style={styles.subHeading}>6. Third-Party Links</h2>
      <p style={styles.paragraph}>
        Our website may contain links to third-party websites that are not operated by us. If you click on a third-party link, you will be directed to that third party&apos;s site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
      </p>

      <h2 style={styles.subHeading}>7. Children&apos;s Privacy</h2>
      <p style={styles.paragraph}>
        Our services are not intended for individuals under the age of [Your Minimum Age, e.g., 18]. We do not knowingly collect personally identifiable information from children. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us. If we become aware that we have collected personal data from children without verification of parental consent, we take steps to remove that information from our servers.
      </p>

      <h2 style={styles.subHeading}>8. Changes to This Privacy Policy</h2>
      <p style={styles.paragraph}>
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date at the top. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
      </p>

      <h2 style={styles.subHeading}>9. Contact Us</h2>
      <p style={styles.paragraph}>
        If you have any questions about this Privacy Policy, please contact us:
      </p>
      <ul style={styles.list}>
        <li>By email: [Your Support Email Address, e.g., privacy@fishchain.tn]</li>
        <li>By visiting this page on our website: [Link to your contact form or main support page]</li>
        <li>By Mail: [Your Company Address, if applicable, e.g., FishChain, [Your Street Address], Kairouan, Tunisia]</li>
      </ul>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '30px',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.7',
    color: '#333',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
  },
  heading: {
    fontSize: '2.8em',
    color: '#0056b3',
    textAlign: 'center',
    marginBottom: '15px',
    fontWeight: 'bold',
  },
  lastUpdated: {
    textAlign: 'center',
    fontSize: '0.9em',
    color: '#777',
    marginBottom: '30px',
  },
  subHeading: {
    fontSize: '1.8em',
    color: '#007bff',
    marginTop: '35px',
    marginBottom: '15px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '5px',
  },
  paragraph: {
    marginBottom: '15px',
    fontSize: '1.05em',
  },
  list: {
    listStyleType: 'disc',
    marginLeft: '25px',
    marginBottom: '15px',
    fontSize: '1.05em',
  },
  'list li': {
    marginBottom: '8px',
  }
};