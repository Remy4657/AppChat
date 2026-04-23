import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { LogOut } from "lucide-react";

const Logout = () => {
  const { signOut } = useAuthStore();
  const handleLogout = async () => {
    try {
      await signOut();
      // navigate("/signin");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      <LogOut className="text-destructive" />
      Log out
    </Button>
  );
};

export default Logout;
