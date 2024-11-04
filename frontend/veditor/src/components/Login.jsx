import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Box, Button, FormControl, FormLabel, Input, Stack, Heading, Text } from "@chakra-ui/react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import { Image } from '@chakra-ui/react'


export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [authqr, setAuthqr] = useState("");
    const [error, setError] = useState(""); // State for showing error message
    const [mfaCode, setMfaCode] = useState("");
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false); // Loading state
    const [mfaMsg, setMfaMsg] = useState("")
    const { onClose } = useDisclosure()
    const handleUsername = (e) => setUsername(e.target.value);
    const handlePassword = (e) => setPassword(e.target.value);
    const handleMfa = (e) => setMfaCode(e.target.value);

    const mfa = () => {
        const mfa_session = Cookies.get('session')
        const mfa_user = Cookies.get('user_id')
        setIsOpen(false);
        axios.post(process.env.REACT_APP_BASE_URL + 'authentication/mfa', {
            mfaCode: mfaCode,
            mfaSession: mfa_session,
            mfaUser: mfa_user
        }).then(function (response) {
            const mfaVerified = response.data.mfaVerified
            if(mfaVerified) {
                setMfaMsg("Your multifactor authentication is verified. Try logging in using the code generated in your app")
            }else {
                setMfaMsg("Your verification has failed. Try again")
            }
        })
    }



    const authenticate = () => {
        setLoading(true); // Start loading
        setError(""); // Clear any previous error

        axios.post(process.env.REACT_APP_USER_SERVICE + 'authentication/login', {
            username: username,
            password: password,
            mfaCode: mfaCode
        })
            .then(function (response) {
                setLoading(false); // Stop loading
                const qrcode = response.data.qrcode;
                const sess = response.data.session;
                const user_id = response.data.user_id
                const token = response.data.authToken

                if(token) {
                    Cookies.set('token', token, {expires: 7});
                    navigate("/profile")
                }else {
                    if (!qrcode) {
                        setError("Authentication failed. Please try again.");
                    } else {
                        setAuthqr(qrcode);
                        setIsOpen(true)
                        Cookies.set('session', sess, { expires: 1 });
                        Cookies.set('user_id', user_id, { expires: 1 });
                        // navigate("/profile");
                    }
                }
                
            })
            .catch(function (error) {
                setLoading(false); // Stop loading

                // Handle different error responses from backend
                if (error.response) {
                    if (error.response.status === 401) {
                        setError("Incorrect username or password. Please try again");
                    } else if (error.response.status === 404) {
                        setError("User does not exist.");
                    } else if (error.response.status === 403) {
                        setError(error.response.data.message || "Authentication error.");
                    } else {
                        setError("An unexpected error occurred. Please try again later.");
                    }
                } else {
                    setError("Network error. Please try again.");
                }
            });
    }

    return (
        <Box
            bg="#F3F8FF"
            p={8}
            borderRadius="md"
            boxShadow="lg"
            maxW="md"
            w="full"
            textAlign="center"
        >
            <Heading as="h1" size="lg" color="#7E30E1" mb={6}>
                Login
            </Heading>

            {error && <Text fontSize='xl' color="red.500" mb={4}>{error}</Text>} {/* Show error message */}
            {mfaMsg && <Text fontSize='xl' color="red.500" mb={4}>{mfaMsg}</Text>} {/* Show mfa verification message */}

            <Stack spacing={4}>
                <FormControl>
                    <FormLabel color="#7E30E1">Username</FormLabel>
                    <Input
                        color="#112D4E"
                        bg="#E9E9F5"
                        placeholder="Username"
                        onChange={handleUsername}
                        isDisabled={loading} // Disable input while loading
                    />
                </FormControl>
                <FormControl>
                    <FormLabel color="#7E30E1">Password</FormLabel>
                    <Input
                        type="password"
                        color="#112D4E"
                        bg="#E9E9F5"
                        placeholder="Password"
                        onChange={handlePassword}
                        isDisabled={loading} // Disable input while loading
                    />
                </FormControl>
                <FormControl>
                <FormLabel color="#7E30E1">Enter the code from the authenticator app</FormLabel>
                    <Input
                        type="text"
                        color="#112D4E"
                        bg="#E9E9F5"
                        placeholder="Code"
                        onChange={handleMfa}
                        isDisabled={loading} // Disable input while loading
                    />
                </FormControl>
                <Button
                    colorScheme="purple"
                    bg="#7E30E1"
                    color="#F3F8FF"
                    _hover={{ bg: '#E26EE5' }}
                    onClick={authenticate}
                    isLoading={loading} // Show loading state on button
                >
                    Login
                </Button>

                {/* Add the text for setting up MFA
            <Text fontSize="md" color="#112D4E" mt={4}>
                This app uses multifactor authentication. The first time you log in you need to set it up. To set up multi-factor authentication (MFA), download the Google Authenticator app on your phone. After logging in, scan the QR code with the app to receive a one-time code for secure login.
            </Text> */}

            {/* Add the text for setting up MFA */}
            <Text fontSize="md" color="#112D4E" mt={4} textAlign="left" mx={4}>
                This app uses multifactor authentication. To set it up, follow these steps:
            </Text>
            <Stack as="ol" spacing={2} color="#112D4E" mt={2} fontSize="md" textAlign="left" mx={4}>
                <Text as="li">Download the Google Authenticator app on your phone.</Text>
                <Text as="li">Log in to your account.</Text>
                <Text as="li">Scan the provided QR code using the Google Authenticator app.</Text>
                <Text as="li">Use the one-time code generated by the app for secure login.</Text>
            </Stack>                
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Scan with google authenticator to get the code</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Box boxSize='sm'>
                                <Image src={authqr} alt='Multifactor authentication qr code' />
                            </Box>
                        </ModalBody>

                        <ModalFooter>
                            <Input
                                type="text"
                                color="#112D4E"
                                bg="#E9E9F5"
                                placeholder="Code.."
                                onChange={handleMfa}
                                isDisabled={loading} // Disable input while loading
                            />
                            <Button colorScheme='blue' mr={3} onClick={mfa}>
                                Submit
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

            </Stack>
        </Box>
    );
}
