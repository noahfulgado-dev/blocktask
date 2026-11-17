import type { Metadata } from "next";

import {
  LegalDocument,
  LegalList,
  LegalSection,
} from "@/components/legal/legal-document";
import { pageMetadata } from "@/lib/site";

const CONTACT_EMAIL = "zeqdev.1@gmail.com";
const LAST_UPDATED = "November 17, 2026";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description:
    "The acceptable-use rules for BlockTask accounts, shared class workspaces, and content.",
  path: "/terms-of-use",
});

export default function TermsOfUsePage() {
  return (
    <LegalDocument
      title="Terms of Use"
      updated={LAST_UPDATED}
      summary="These Terms of Use explain what is and is not allowed when using BlockTask. They apply to everyone who accesses the service, including class admins and members. They supplement our Terms of Service; if the two conflict, the Terms of Service controls."
      otherDocument={{
        href: "/terms-of-service",
        label: "Terms of Service",
        description:
          "Read the full agreement covering accounts, liability, and the service.",
      }}
    >
      <LegalSection title="1. Scope">
        <p>
          These rules apply whenever you access or use BlockTask, whether
          through a browser, a link, or any feature such as class boards,
          reminders, invite codes, or embedded content. By using BlockTask, you
          agree to follow these rules.
        </p>
      </LegalSection>

      <LegalSection title="2. Accounts and access">
        <LegalList
          items={[
            "Use your own account and keep your credentials private.",
            "Provide accurate information and keep your email address current.",
            "Do not create accounts for other people, impersonate someone else, or use another person's account.",
            "Do not attempt to bypass access controls, row-level security, invite-code requirements, or the CvSU email restriction.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Respectful conduct">
        <p>
          BlockTask workspaces are shared with your blockmates. Treat other
          users with respect and keep the space usable for everyone.
        </p>
        <LegalList
          items={[
            "Do not harass, threaten, bully, or intimidate other users.",
            "Do not post hateful, discriminatory, violent, or sexually explicit content.",
            "Do not dox, publish private information, or share someone's personal data without their consent.",
            "Do not spam, flood boards with irrelevant content, or deliberately disrupt class discussions and task tracking.",
            "Do not impersonate another student, a class admin, a CvSU official, or the BlockTask maintainer.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Academic integrity">
        <p>
          BlockTask is an organizational tool for tracking tasks and deadlines.
          Do not use it to facilitate cheating, plagiarism, unauthorized
          collaboration, or any other violation of CvSU academic policies. You
          remain responsible for following the rules that apply to your courses.
        </p>
      </LegalSection>

      <LegalSection title="5. Shared class workspaces">
        <LegalList
          items={[
            "Only join classes you are entitled to join, and do not share invite codes with people outside your block.",
            "Do not delete, reassign, or edit another member's task without permission, unless class settings or your admin role allow it.",
            "Follow the decisions of class admins about membership, settings, and reminders.",
            "Keep content relevant to the class and avoid posting sensitive personal information about yourself or others.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Prohibited technical activity">
        <LegalList
          items={[
            "Do not access, probe, scan, or test the security of BlockTask or its providers without written permission.",
            "Do not introduce malware, viruses, or code designed to disrupt or damage the service.",
            "Do not launch denial-of-service attacks, overload requests, or otherwise interfere with the service's operation.",
            "Do not scrape, crawl, or use bots to collect data from BlockTask at scale.",
            "Do not reverse engineer, decompile, or attempt to extract source code from the service, except where the law expressly permits it.",
            "Do not abuse the free tiers, quotas, or resources of Supabase, Vercel, Meta, or any other provider used by BlockTask.",
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Content standards">
        <p>
          You are responsible for everything you submit. Content must be lawful
          and must not infringe another person&apos;s intellectual property,
          privacy, or other rights. Do not upload or post content that you do
          not have permission to share.
        </p>
        <p>
          We may remove content that violates these rules, the Terms of Service,
          or applicable law, and we may do so without prior notice.
        </p>
      </LegalSection>

      <LegalSection title="8. Third-party content and embeds">
        <p>
          The dashboard may display the official CvSU CSG Imus Facebook page
          through Meta&apos;s Page plugin. That content is controlled by Meta and
          the page owner. We do not endorse, verify, or take responsibility for
          third-party content, and your use of it may be subject to Meta&apos;s
          terms and policies.
        </p>
      </LegalSection>

      <LegalSection title="9. Reporting problems">
        <p>
          If you encounter content or behavior that violates these Terms of Use,
          or if you believe your account or workspace has been compromised,
          report it to{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-primary underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>
          . Include enough detail for us to investigate.
        </p>
      </LegalSection>

      <LegalSection title="10. Enforcement">
        <p>
          We may investigate suspected violations and take any action we
          consider appropriate, including removing content, issuing a warning,
          restricting features, suspending access, or terminating an account. We
          may also report unlawful activity to the appropriate authorities.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to these Terms of Use">
        <p>
          We may update these Terms of Use from time to time. The
          &ldquo;Last updated&rdquo; date at the top of this page shows when the
          current version took effect. Continued use of BlockTask after an update
          means you accept the revised rules.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          Questions about these Terms of Use? Contact the BlockTask maintainer
          at{" "}
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
