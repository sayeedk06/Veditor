import { Box, Button, Flex, HStack, Link, Text, Image } from '@chakra-ui/react';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import VeditorHome from "../assets/VeditorHome2.png"


const Navbar = ({ userId }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        Cookies.remove("token");
        navigate('/');
    }

    return (
        <Box bg="transparent" p={4} color="#F3F8FF">
            <Flex justify="space-between" align="center" maxW="1200px" mx="auto">               
                 <Box mt={4} textAlign="left">
                        <Image
                            src= {VeditorHome} 
                            alt="VeditorLogo"
                            boxSize="300" 
                            objectFit="contain" 
                            height="100%" 
                        />                   
                    </Box>
                <HStack spacing={6}>
                    <Link href="/profile" _hover={{ textDecoration: 'none', color: '#E9E9F5' }}>
                        <Text fontSize="lg">Profile</Text>
                    </Link>
                    <Link href="/gallery" _hover={{ textDecoration: 'none', color: '#E9E9F5' }}>
                        <Text fontSize="lg">Gallery</Text>
                    </Link>
                    {/* <Link href="/premium" _hover={{ textDecoration: 'none', color: '#E9E9F5' }}>
                        <Text fontSize="lg">Premium</Text>
                    </Link> */}
                    
                    <Button
                        onClick={handleLogout}
                        bg="#E26EE5"
                        color="#F3F8FF"
                        _hover={{ bg: '#7E30E1', color: '#F3F8FF' }}
                    >
                        Logout
                    </Button>
                </HStack>
            </Flex>
        </Box>
    );
};

export default Navbar;
