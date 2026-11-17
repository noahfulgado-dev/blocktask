import type { Metadata } from "next";
import Link from "next/link";

import {
  LegalDocument,
  LegalList,
  LegalSection,
} from "@/components/legal/legal-document";

const CONTACT_EMAIL = "zeqdev.1@gmail.com";
const LAST_UPDATED = "November 17, 2026";

export const metadata: Metadata = {
  title: "Terms of Service — BlockTask",
  description:
    "The agreement that governs your access to and use of BlockTask.",
};

export default function TermsOfServicePage() {
  return (
    <LegalDocument
      title="Terms of Service"
      updated={LAST_UPDATED}
      summary="These Terms of Service (the “Terms”) are an agreement between you and the BlockTask maintainer. They explain the rules for using BlockTask, what you can expect from the service, and what we expect from you. By creating an account, signing in, or otherwise using BlockTask, you agree to these Terms."
      otherDocument={{
        href: "/terms-of-use",
        label: "Terms of Use",
        description:
          "Read the acceptable-use rules that apply alongside this agreement.",
      }}
    >
      <LegalSection title="1. About BlockTask">
        <p>
          BlockTask is a shared task board for blocks and sections at Cavite
          State University (CvSU). It lets a class or block create a workspace,
          invite members with a code, and track tasks, deadlines, and reminders
          together.
        </p>
        <p>
          BlockTask is an independent project. It is not an official CvSU
          service and is not associated with, affiliated with, or endorsed by
          Cavite State University.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility and accounts">
        <p>
          You may use BlockTask only if you are a currently enrolled CvSU
          student or you have been authorized by the maintainer. Sign-up is
          restricted to email addresses ending in{" "}
          <span className="font-medium text-foreground">@cvsu.edu.ph</span>,
          except for addresses the maintainer explicitly allowlists. If you are
          under 18, you confirm that you have permission from a parent or
          guardian to use the service.
        </p>
        <LegalList
          items={[
            "Provide accurate account information, including your full name and email address.",
            "Keep your password confidential and do not share your account or login credentials.",
            "You are responsible for all activity that happens under your account.",
            "Tell us promptly if you believe your account has been accessed without permission.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Your classes and shared content">
        <p>
          A class workspace is shared with everyone who joins it. Class admins
          can change class settings, manage members and roles, regenerate invite
          codes, edit reminders, and delete the class. Content you post in a
          class may be visible to all members of that class.
        </p>
        <p>
          Invite codes are meant for your blockmates. Do not publish them
          publicly or share them with people who should not have access to the
          workspace.
        </p>
      </LegalSection>

      <LegalSection title="4. User content">
        <p>
          You keep ownership of the content you submit, such as task titles,
          descriptions, reminders, and comments. By posting content, you give
          BlockTask a non-exclusive, worldwide, royalty-free license to host,
          store, display, and transmit that content as needed to operate and
          provide the service.
        </p>
        <p>
          You are responsible for the content you post. You must have the right
          to share it and it must not violate any law or the rights of another
          person. We may remove content that violates these Terms or the Terms
          of Use.
        </p>
      </LegalSection>

      <LegalSection title="5. Acceptable use">
        <p>
          Your use of BlockTask must also comply with our{" "}
          <Link
            href="/terms-of-use"
            className="font-medium text-primary underline underline-offset-2"
          >
            Terms of Use
          </Link>
          , which describes prohibited conduct and how the service may be
          enforced. Prohibited activity includes unauthorized access, abuse of
          the service or its providers, harassment, and posting unlawful or
          infringing content.
        </p>
      </LegalSection>

      <LegalSection title="6. Third-party services">
        <p>
          BlockTask relies on third-party providers, including Supabase for
          authentication, database, and realtime features; Vercel for hosting;
          and Meta&apos;s Facebook Page plugin to display the official CvSU CSG
          Imus page feed on the dashboard. Your use of those features may also
          be subject to the providers&apos; own terms and privacy policies.
        </p>
        <p>
          We do not control third-party services and are not responsible for
          their availability, content, or practices. External links and embedded
          content are provided for convenience only.
        </p>
      </LegalSection>

      <LegalSection title="7. Availability and changes to the service">
        <p>
          BlockTask is provided free of charge and on an &ldquo;as is&rdquo; and
          &ldquo;as available&rdquo; basis. We do not guarantee uptime,
          uninterrupted access, error-free operation, or that any data will be
          preserved indefinitely. The service may be changed, limited, suspended,
          or discontinued at any time, including for maintenance or because of
          provider outages.
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimer of warranties">
        <p>
          To the maximum extent permitted by law, BlockTask is provided without
          warranties of any kind, whether express, implied, or statutory,
          including warranties of merchantability, fitness for a particular
          purpose, and non-infringement. BlockTask is an organizational tool
          only. It is not an official academic record, and it does not guarantee
          that you will meet a deadline, complete a requirement, or receive any
          particular grade.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation of liability">
        <p>
          To the maximum extent permitted by law, the maintainer will not be
          liable for any indirect, incidental, special, consequential, or
          punitive damages, or for any loss of data, loss of access, missed
          deadlines, academic consequences, or other harm arising from your use
          of or inability to use BlockTask. Because BlockTask is provided free of
          charge, the maintainer&apos;s total liability for any claim relating to
          the service is limited to the maximum extent permitted by law.
        </p>
        <p>
          Some jurisdictions do not allow certain limitations of liability, so
          parts of this section may not apply to you. Nothing in these Terms
          limits rights that cannot lawfully be limited.
        </p>
      </LegalSection>

      <LegalSection title="10. Suspension and termination">
        <p>
          You may stop using BlockTask at any time. We may suspend, restrict, or
          terminate your access if you violate these Terms, the Terms of Use, or
          applicable law, or if your use creates risk or harm to other users, the
          service, or its providers. Class admins may also remove members or
          delete a class, which can result in the loss of content in that
          workspace.
        </p>
        <p>
          To request deletion of your account, contact{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-primary underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          . Some content may remain in backups or with other class members after
          deletion.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to these Terms">
        <p>
          We may update these Terms from time to time. When we do, we will
          update the &ldquo;Last updated&rdquo; date at the top of this page. If
          a change is material, we may also notify you through the service.
          Continued use of BlockTask after an update means you accept the
          revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="12. Governing law">
        <p>
          These Terms are governed by the laws of the Republic of the
          Philippines, without regard to conflict-of-law rules. Any dispute
          relating to these Terms or the service will be subject to the
          jurisdiction of the appropriate courts in the Philippines.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>
          Questions about these Terms? Contact the BlockTask maintainer at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-primary underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
