import { useState } from 'react';
import Navbar from '../components/Navbar';
import LandingFooter from '../components/LandingFooter';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { contactService } from '../api/contactService';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await contactService.send(form);
      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'We could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="pt-12 min-h-screen flex flex-col justify-between font-body">
        <main className="flex-grow container mx-auto px-6 py-12 md:py-16 max-w-5xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-give/50"></div>
              <span className="font-logo italic text-give text-2xl font-bold tracking-wide">
                Contact Us
              </span>
              <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-give/50"></div>
            </div>
            <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tight leading-none mb-6 text-gray-900 dark:!text-white">
              We'd love to hear <span className="text-give italic">from you.</span>
            </h1>
            <div className="font-sach font-medium text-md flex items-center justify-center">
              <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                Have questions about skills bartering? Want to suggest new features? Reach out and we'll get back to you as soon as possible.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mt-8">
            {/* Info panel */}
            <div className="md:col-span-5 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-8 rounded-2xl shadow-sm space-y-6">
              <h2 className="text-2xl font-bold font-display text-gray-900 dark:!text-white mb-4">
                Contact Information
              </h2>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-give/10 flex items-center justify-center text-give shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Email Us</h3>
                  <p className="text-md font-sach font-semibold text-gray-500 dark:text-gray-400 mt-1">support@quidproknow.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-give/10 flex items-center justify-center text-give shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Call Us</h3>
                  <p className="text-sm font-sach font-semibold text-gray-500 dark:text-gray-400 mt-1">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-give/10 flex items-center justify-center text-give shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Location</h3>
                  <p className="text-md font-semibold font-sach text-gray-500 dark:text-gray-400 mt-1">
                    San Francisco, California, USA
                  </p>
                </div>
              </div>
            </div>

            {/* Form panel */}
            <div className="md:col-span-7 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-8 rounded-2xl shadow-sm">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold font-sach text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-500 font-sach dark:text-gray-400 max-w-xl mx-auto">
                    Thank you for reaching out. We will get back to you shortly.
                  </p>

                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-md !font-sach font-semibold text-give hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex flex-col gap-1.5 font-sach font-semibold">
                    <label htmlFor="name" className="text-sm font-semibold text-gray-600 dark:text-gray-400">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="px-3.5 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 font-sach">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-600 dark:text-gray-400">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="px-3.5 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 font-sach">
                    <label htmlFor="message" className="text-sm font-semibold text-gray-600 dark:text-gray-400">Message</label>
                    <textarea
                      id="message"
                      rows="4"
                      required
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      className="px-3.5 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-give focus:ring-4 focus:ring-give/5 transition-all text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-white resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {error && (
                    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-2.5 bg-give hover:brightness-110 text-white rounded-full !font-sach text-sm font-semibold shadow-lg shadow-give/10 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
