import Login from "../components/Login";
import Register from "../components/Register";
import Footer from "../components/Footer";
import { Box, Text, Stack, Container, Divider, Image } from "@chakra-ui/react";
import VeditorHome from "../assets/VeditorHome2.png"


export default function Home() {
    return (
        <>
        <Box 
            className="App-header"
            bgGradient="linear(to-b, #7E30E1, #E26EE5)"  // Use the gradient from the Login and Register components
            minH="100vh"
            py={10}
            color="#F3F8FF"  // Set text color to match the placeholders and labels in Login/Register
        >
            <Container maxW="container.lg">
                <Stack spacing={8} align="center">
                    
                    <Box mt={4} textAlign="center">
                        <Image
                            src= {VeditorHome} 
                            alt="Your Image"                            
                            mx="auto"
                        />
                    </Box>
                    <Text 
                        fontSize='lg' 
                        textAlign="center" 
                        maxW="3xl"
                        px={4}
                        color="#F3F8FF"
                    >
                        Welcome to Veditor, the easy way to turn your photos into stunning videos or convert videos into GIFs. Simply upload your images or videos, customize with transitions, animations, and effects, and add music to bring your vision to life. Perfect for presentations, marketing, or personal projects—no technical skills needed. Start creating with Veditor today!
                    </Text>
                    <Divider orientation="horizontal" borderColor="#F3F8FF" />
                    <Stack direction={['column', 'row']} spacing={8} width="full">
                
                            <Login />
                    
                            <Register />

                    </Stack>
                </Stack>
            </Container>
            
        </Box>
        <Footer/>
        </>
    );
}
