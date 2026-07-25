import Sidebar from "@/components/layout/Sidebar";
import { Box } from "@mui/material";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", overflow: "hidden" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          bgcolor: "background.default",
          position: "relative",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
