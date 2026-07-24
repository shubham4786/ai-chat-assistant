'use client';

import { Message } from '@/types/message';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import Image from 'next/image';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import { Avatar, Box, Paper, Stack, Typography } from '@mui/material';

interface MessageListProps {
  messages: Message[];
  onRegenerate: () => void;
}

export default function MessageList({ messages, onRegenerate }: MessageListProps) {
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    // You can add a toast notification here to indicate success
  };

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      {messages.map((message, index) => (
        <Stack
          key={message.id}
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'flex-start',
            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
          }}
        >
          {message.role === 'assistant' && (
            <Avatar sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
              <SmartToyOutlinedIcon />
            </Avatar>
          )}
          <Box sx={{ position: 'relative', '&:hover .copy-button': { opacity: 1 } }}>
            <Paper
              sx={{
                p: 1.5,
                maxWidth: 'lg',
                bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                '& a': {
                    color: message.role === 'user' ? 'primary.contrastText' : 'primary.main',
                    textDecoration: 'underline'
                }
              }}
            >
              <IconButton
                size="small"
                className="copy-button"
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  color: message.role === 'user' ? 'primary.contrastText' : 'text.secondary'
                }}
                onClick={() => handleCopy(message.content)}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
              {message.image && (
                <Box sx={{ mb: 1, borderRadius: 1, overflow: 'hidden' }}>
                  <Image src={message.image} alt="User uploaded image" width={200} height={200} />
                </Box>
              )}
              <Typography component="div" sx={{ '& > p': { margin: 0 } }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {message.content}
                </ReactMarkdown>
              </Typography>
            </Paper>
            {message.role === 'assistant' && index === messages.length - 1 && (
              <Stack direction="row" sx={{ mt: 1, justifyContent: 'flex-start' }}>
                <Button onClick={onRegenerate} startIcon={<RefreshIcon />} size="small">
                  Regenerate
                </Button>
              </Stack>
            )}
          </Box>
          {message.role === 'user' && (
            <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <PersonIcon />
            </Avatar>
          )}
        </Stack>
      ))}
    </Stack>
  );
}
