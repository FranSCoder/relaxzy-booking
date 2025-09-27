"use client";

import { usePathname, useRouter } from "next/navigation";
import {
    CssBaseline,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Toolbar,
    Button,
    Stack,
    Container,
    AppBar,
} from "@mui/material";
import { drawerWidth, menuPages } from "@/constants";
import Image from "next/image";

export default function LayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        console.log("Logging out...");
        router.push("/login");
    };

    const appBarHeight = 64; // typical MUI AppBar height in px

    return (
        <Stack sx={{ minHeight: "100vh" }}>
            <CssBaseline />

            {/* Full-width AppBar at top */}
            <AppBar position="fixed" color="primary">
                <Toolbar>
                    <Image
                        src="/BigTextHorizontalClearText.png"
                        alt="Relaxzy Logo"
                        width={200}
                        height={40}
                        priority
                    />
                </Toolbar>
            </AppBar>

            {/* Sidebar + Main content */}
            <Stack direction="row" sx={{ pt: `${appBarHeight}px` }}>
                {/* Sidebar */}
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: {
                            width: drawerWidth,
                            boxSizing: "border-box",
                            top: `${appBarHeight}px`, // start below AppBar
                            height: `calc(100vh - ${appBarHeight}px)`, // full height minus AppBar
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            backgroundColor: "secondary.main",
                        },
                    }}>
                    <Stack sx={{ flexGrow: 1 }}>
                        <List>
                            {menuPages.map((page) => (
                                <ListItem key={page.href} disablePadding>
                                    <ListItemButton
                                        selected={pathname === page.href}
                                        onClick={() => router.push(page.href)}>
                                        <ListItemText primary={page.text} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Stack>

                    <Stack sx={{ p: 2 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            fullWidth
                            onClick={handleLogout}>
                            Logout
                        </Button>
                    </Stack>
                </Drawer>

                {/* Main content */}
                <Container component="main" maxWidth={false}>
                    {children}
                </Container>
            </Stack>
        </Stack>
    );
}
