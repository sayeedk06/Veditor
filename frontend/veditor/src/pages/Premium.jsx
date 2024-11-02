import { useEffect, useState } from "react"
import axios from 'axios';
import Cookies from 'js-cookie';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MakeGif from "../components/MakeGif";
import { Heading, Box } from '@chakra-ui/react';
import { useNavigate } from "react-router-dom";




export default function Premium() {
    const navigate = useNavigate();
    const [userName, setUsername] = useState("");
    const [userId, setUserID] = useState("");
    const [groups, setGroups] = useState([]);


    useEffect(() => {
        const token = Cookies.get('token')
        const header = { 'Authorization': `Bearer ${token}` }

        // axios.get(process.env.REACT_APP_BASE_URL + 'user', { headers: header })
        axios.get(process.env.REACT_APP_BASE_URL + 'user', { headers: header })
            .then(function (response) {
                return response.data
            }).then(function (data) {
                setUsername(data.name);
                setUserID(data.email)
                setGroups(data.groups)

            }).catch(function (err) {
                console.log(err)
            })



    }, [])

    return (
        <Box>
            <Box
                bgGradient="linear(to-b, #7E30E1, #E26EE5)"
                height="fit-content"
                minHeight="100vh"
            >
                <Navbar />

                <Box
                    p={8}
                    maxW="lg"
                    mx="auto"
                    mt={5}
                    bg="transparent"
                    borderRadius="md"
                //boxShadow="lg"
                >
                    {/* Welcome Heading */}
                    <Heading as="h1" mb={5} color="white" fontSize="7xl" textAlign="left" ml={-60}>
                        Welcome,
                    </Heading>
                    <Heading as="h1" mb={5} color="white" fontSize="7xl" textAlign="left" whiteSpace="nowrap" ml={-60}>
                        {userName}
                    </Heading>

                </Box>
                {/* Upload Component */}
                <Box
                    bgGradient="transparent"
                    maxHeight="700px"
                    height="fit-content"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    p={4}
                    maxW="xL"
                    w="full"
                // minHeight="100vh"
                // display="flex"
                // justifyContent="center"
                // alignItems="center"
                // p={4}
                >
                    <MakeGif />

                </Box>

            </Box>
            <Footer />
        </Box>

    )
}   