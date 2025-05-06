import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const SupportPage = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email.includes("@")) {
      toast({ title: "Invalid email", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("user_email", form.email);
    formData.append("subject", `New Support Ticket from ${form.name}`);
    formData.append("message_body", form.message);

    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/support_email", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unknown error occurred");
      }

      setStatus("success");
      setTicketId(data.ticket_id);
      setForm({ name: "", email: "", message: "" });
      toast({
        title: "Support request submitted",
        description: `Ticket ID: ${data.ticket_id}`,
      });
    } catch (error: any) {
      setStatus("error");
      toast({
        title: "Failed to send support email",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded shadow">
      <div className="absolute top-4 right-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/")}>
          Go to Homepage
        </Button>
      </div>

      <h1 className="text-xl font-bold mb-4">Support</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required />
        <Input name="email" placeholder="Your Email" value={form.email} onChange={handleChange} required />
        <Textarea name="message" placeholder="Your Query" value={form.message} onChange={handleChange} required />
        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Query"}
        </Button>

        {status === "success" && (
          <p className="text-green-600 text-sm mt-2">
            Support email sent successfully. Ticket ID: <strong>{ticketId}</strong>.
          </p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-sm mt-2">Something went wrong while sending your request.</p>
        )}
      </form>
    </div>
  );
};

export default SupportPage;
