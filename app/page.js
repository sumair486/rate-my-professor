import { Box, Button, Container, CssBaseline, Card, CardContent, Typography } from '@mui/material';
import Navbar from "@/components/navbar"
import ProfessorCarousel from '@/components/carousel';

export default function Home() {
  return (
  <>
      {/* Header */}
      <Navbar home={true}/>

      <Container maxWidth="lg">
        <CssBaseline />
        
        {/* Search Section */}
        <Box sx={{ mt: '15vh', mb: 4, textAlign: 'center', color: "white" }}>
          <Typography variant="h2" gutterBottom>
            Project 5: AI Rate My Professor
          </Typography>
          <Button href='/generate' sx={{ backgroundColor: '#F6B17A', color: "white", px: 4, borderRadius: 4}}> Generate </Button>
        </Box>
        
        {/* Professors List */}
        <ProfessorCarousel/>
      </Container>
    </>
    );
}
