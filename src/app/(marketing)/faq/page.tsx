import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
  {
    question: "How does Meti work?",
    answer: "Meti connects independent professionals with people seeking specialized advisory services. You search for the service you need, choose a date and time, pay with Mercado Pago, and join the video call from the platform.",
  },
  {
    question: "How much does Meti cost as a client?",
    answer: "There is no cost to use the platform as a client. You only pay the advisor's service price plus a platform fee that is shown transparently at checkout before you pay.",
  },
  {
    question: "How can I become an advisor on Meti?",
    answer: "Register as a user, complete the verification process with your professional documents, and create your services and schedule. An administrator will verify your profile so you can receive clients.",
  },
  {
    question: "What happens if I cancel an advisory session?",
    answer: "You can reschedule for free with at least 24 hours of advance notice. Canceling without rescheduling does not result in a payment refund, according to the advisor's cancellation policy.",
  },
  {
    question: "How are payments processed?",
    answer: "Payments are processed through Mercado Pago. Each advisor configures their own Mercado Pago credentials to receive payments directly. The platform charges a transparent fee shown at checkout.",
  },
  {
    question: "How do video calls work?",
    answer: "Advisory sessions are conducted via integrated video calls on the platform through LiveKit. You do not need to install anything else; just click 'Join' on your appointment and the video call will open automatically.",
  },
  {
    question: "Can I change my password or sign-in method?",
    answer: "You can currently sign in with Google or with your email and password. If you created your account with email and password, use that method. If you used Google, sign in with Google.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We do not sell your personal information. Payments are processed through Mercado Pago with SSL/TLS encryption. Video calls are protected with unique credentials per session. See our Privacy Policy for more details.",
  },
];

export default function FAQPage() {
  return (
    <div className="container-meti py-16 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">
        Frequently asked questions
      </h1>
      <p className="text-[var(--text-muted)] mb-8">
        Find answers to the most common questions about Meti
      </p>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-2">
                {faq.question}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {faq.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-[var(--text-muted)] mb-3">
          Didn&apos;t find what you were looking for?
        </p>
        <Link href="/services" className="text-sm text-[var(--primary)] font-medium hover:underline">
          Browse advisors
        </Link>
      </div>
    </div>
  );
}
