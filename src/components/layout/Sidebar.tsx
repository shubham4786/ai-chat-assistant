"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { Chat } from '@/types/chat';
import { useUIStore } from "@/store/ui";
import { useMediaQuery, useTheme } from "@mui/material";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Avatar,
  Toolbar,
  CircularProgress,
  Stack,
} from '@mui/material';
import AddCommentIcon from '@mui/icons-material/AddComment';
import ChatIcon from '@mui/icons-material/Chat';

export const drawerWidth = 280;

async function createChat() {
  const response = await fetch('/api/chats', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

async function fetchChats(): Promise<Chat[]> {
    const response = await fetch('/api/chats');
    if(!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

async function renameChat({ chatId, title }: { chatId: string, title: string }) {
    const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

async function deleteChat(chatId: string) {
    const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

export default function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openedMenuChatId, setOpenedMenuChatId] = useState<null | string>(null);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile, setSidebarOpen]);

  const handleClick = (event: React.MouseEvent<HTMLElement>, chatId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setOpenedMenuChatId(chatId);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenedMenuChatId(null);
  };

  const { data: chats, isLoading: isLoadingChats } = useQuery({
      queryKey: ['chats'],
      queryFn: fetchChats,
      enabled: !!session,
  });

  const createChatMutation = useMutation({
    mutationFn: createChat,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      router.push(`/chat/${data._id}`);
    },
    onError: (error) => {
      console.error("Error creating chat:", error);
    }
  });

  const renameMutation = useMutation({
    mutationFn: renameChat,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (error) => {
        console.error("Error renaming chat:", error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChat,
    onSuccess: (data, chatId) => {
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        if (params.chatId === chatId) {
            router.push('/chat');
        }
    },
    onError: (error) => {
        console.error("Error deleting chat:", error);
    }
  });

  const handleNewChat = () => {
    createChatMutation.mutate();
  };

  const handleRename = (chatId: string) => {
    const newTitle = prompt("Enter new chat title:");
    if (newTitle) {
        renameMutation.mutate({ chatId, title: newTitle });
    }
    handleClose();
  };

  const handleDelete = (chatId: string) => {
    if (confirm("Are you sure you want to delete this chat?")) {
        deleteMutation.mutate(chatId);
    }
    handleClose();
  };

  const filteredChats = chats?.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ justifyContent: "space-between", gap: 1 }}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
          <ChatIcon />
        </Avatar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flexGrow: 1 }}>
          <Typography variant="h6" noWrap component="div">
            AI Chat
          </Typography>
        </Box>
        <IconButton
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          onClick={toggleSidebar}
          size="small"
        >
          {isSidebarOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
        </IconButton>
      </Toolbar>
      <Box sx={{ p: 2 }}>
        <Button 
          variant="contained" 
          fullWidth 
          onClick={handleNewChat} 
          disabled={createChatMutation.isPending}
          startIcon={<AddCommentIcon />}
        >
          {createChatMutation.isPending ? 'Creating...' : 'New Chat'}
        </Button>
        <TextField 
          placeholder="Search chats..." 
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mt: 2 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {isLoadingChats ? (
            <Stack sx={{ alignItems: "center", mt: 4 }}>
                <CircularProgress />
            </Stack>
        ) : (
            <List>
                {filteredChats?.map((chat) => (
                    <ListItem key={chat._id} disablePadding>
                        <ListItemButton
                          selected={params.chatId === chat._id}
                          onClick={() => router.push(`/chat/${chat._id}`)}
                        >
                            <ListItemText primary={chat.title} primaryTypographyProps={{ noWrap: true }} />
                            <IconButton
                                aria-label="more"
                                onClick={(e) => handleClick(e, chat._id)}
                                size="small"
                            >
                                <MoreVertIcon />
                            </IconButton>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        )}
      </Box>

      {session?.user && (
        <Box sx={{ p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
             {session.user.image && (
              <Avatar>
                <Image
                    src={session.user.image}
                    alt={session.user.name || 'User avatar'}
                    width={40}
                    height={40}
                />
              </Avatar>
            )}
            <Typography fontWeight="bold" noWrap>{session.user.name}</Typography>
          </Stack>
          <Button variant="outlined" fullWidth onClick={() => signOut()} sx={{ mt: 2 }}>
            Logout
          </Button>
        </Box>
      )}

      {/* This Menu is shared by all list items */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'long-button' }}
      >
        <MenuItem onClick={() => openedMenuChatId && handleRename(openedMenuChatId)}>
            Rename
        </MenuItem>
        <MenuItem onClick={() => openedMenuChatId && handleDelete(openedMenuChatId)} sx={{ color: 'error.main' }}>
            Delete
        </MenuItem>
      </Menu>
    </Box>
  );

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isSidebarOpen}
      onClose={toggleSidebar}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: "sidebar.main",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
