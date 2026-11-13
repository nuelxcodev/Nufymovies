import AccountForms from "@/components/AccountForms";
import { requirePageUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Account" };

export default async function Account() {
  const user = await requirePageUser();
  if (user.isAdmin) redirect("/admin");
  return (
    <main className="page max-w-4xl pt-24">
      <h1 className="text-4xl font-extrabold">Account</h1>
      <AccountForms
        profile={{
          username: user.hasUsername ? user.username : "",
          hasUsername: user.hasUsername,
          email: user.email,
          phone: user.phone,
          country: user.country,
          age: user.age,
          hasAge: Boolean(user.age),
          tierLabel: user.tier.label,
        }}
      />
    </main>
  );
}
