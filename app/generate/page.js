import { Container } from "@mui/material";
import Navbar from "@/components/navbar"
import Chatbot from "@/components/chatbot";

export default function Generate() {
  return (
    <>
      {/* Header */}
      <Navbar home={false}/>
      <Container>
        <Chatbot/>
      </Container>
    </>
  );
}