import { Input, Image, Box, Heading, Button, Stack, FormControl, FormLabel, Text, IconButton, InputGroup, InputRightElement, Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverArrow } from '@chakra-ui/react';
import { useState } from 'react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import VPremium from "../assets/VPremium.gif"

export default function Register() {
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({ name: "", username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordValidations, setPasswordValidations] = useState({
        length: false,
        hasNumber: false,
        hasSpecialChar: false,
        hasUppercase: false,
        hasLowercase: false,
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputs((prevFormData) => ({ ...prevFormData, [name]: value }));

        if (name === 'password') {
            validatePassword(value);
        }
    };

    const validatePassword = (password) => {
        setPasswordValidations({
            length: password.length >= 8,
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
        });
    };

    const handleForm = (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    axios.post(process.env.REACT_APP_BASE_URL + 'authentication/register', inputs, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((response) => {
            console.log(response);
            setLoading(false);
            navigate('/');
        })
        .catch((error) => {
            setLoading(false);
            if (error.response) {
                if (error.response.status === 409) {
                    setError("Username already exists. Please choose a different one.");
                } else if (error.response.status === 400) {
                    setError("Invalid input. Please make sure all fields are filled and the email and password meet the requirements.");
                } else {
                    setError("An unexpected error occurred. Please try again.");
                }
            } else {
                setError("Network error. Please check your connection and try again.");
            }
        });
    };

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
                Register
            </Heading>

            {error && <Text fontSize='xl' color="red.500" mb={4}>{error}</Text>}

            <form onSubmit={handleForm} style={{ opacity: '0.9' }}>
                <Stack spacing={4}>
                    <FormControl>
                        <FormLabel color="#7E30E1">Name</FormLabel>
                        <Input
                            mt={2}
                            placeholder='John Doe'
                            name='name'
                            onChange={handleChange}
                            color="#7E30E1"
                            bg="#E26EE5"
                            _placeholder={{ color: '#F3F8FF' }}
                            isDisabled={loading}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel color="#7E30E1">Username</FormLabel>
                        <Input
                            type='text'
                            mt={2}
                            placeholder='John_1100'
                            name='username'
                            onChange={handleChange}
                            color="#7E30E1"
                            bg="#E26EE5"
                            _placeholder={{ color: '#F3F8FF' }}
                            isDisabled={loading}
                        />
                        <Text color="#7E30E1" fontSize='xs'>
                            Username is case sensitive
                        </Text>
                    </FormControl>
                    <FormControl>
                        <FormLabel color="#7E30E1">Email</FormLabel>
                        <Input
                            type='email'
                            mt={2}
                            placeholder='john@example.com'
                            name='email'
                            onChange={handleChange}
                            color="#7E30E1"
                            bg="#E26EE5"
                            _placeholder={{ color: '#F3F8FF' }}
                            isDisabled={loading}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel color="#7E30E1">Password</FormLabel>
                        <Popover placement='right' closeOnBlur={false} closeOnEsc={false}>
                            <PopoverTrigger>
                                <InputGroup>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder='Password'
                                        name='password'
                                        onChange={handleChange}
                                        color="#7E30E1"
                                        bg="#E26EE5"
                                        _placeholder={{ color: '#F3F8FF' }}
                                        isDisabled={loading}
                                    />
                                    <InputRightElement>
                                        <IconButton
                                            icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                            onClick={() => setShowPassword(!showPassword)}
                                            variant='ghost'
                                            aria-label='Toggle Password Visibility'
                                        />
                                    </InputRightElement>
                                </InputGroup>
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverArrow />
                                <PopoverBody>
                                    <Text fontSize='sm' color={passwordValidations.length ? "green.500" : "orange.500"}>
                                        Minimum 8 characters
                                    </Text>
                                    <Text fontSize='sm' color={passwordValidations.hasNumber ? "green.500" : "orange.500"}>
                                        Contains at least 1 number
                                    </Text>
                                    <Text fontSize='sm' color={passwordValidations.hasSpecialChar ? "green.500" : "orange.500"}>
                                        Contains at least 1 special character
                                    </Text>
                                    <Text fontSize='sm' color={passwordValidations.hasUppercase ? "green.500" : "orange.500"}>
                                        Contains at least 1 uppercase letter
                                    </Text>
                                    <Text fontSize='sm' color={passwordValidations.hasLowercase ? "green.500" : "orange.500"}>
                                        Contains at least 1 lowercase letter
                                    </Text>
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>
                    </FormControl>

                    <Button
                        type='submit'
                        mt={5}
                        colorScheme="purple"
                        bg="#7E30E1"
                        color="#F3F8FF"
                        _hover={{ bg: '#E26EE5' }}
                        isLoading={loading}
                        isDisabled={
                            !passwordValidations.length || 
                            !passwordValidations.hasNumber ||
                            !passwordValidations.hasSpecialChar ||
                            !passwordValidations.hasUppercase ||
                            !passwordValidations.hasLowercase ||
                            loading
                        } // Disable until all conditions are met
                    >
                        Register
                    </Button>
                    <Box mt={4} textAlign="center">
                        <Image
                            src= {VPremium} 
                            alt="Your Image"                            
                            mx="auto"
                        />
                        <Text mt={2} color="#7E30E1" fontSize="sm">
                            Upgrade now for only $5/month and 
                        </Text>
                         <Text mt={2} color="#7E30E1" fontSize="sm">
                             unlock exclusive features!
                        </Text>
                    </Box>

                    <Button
                        type='submit'
                        mt={5}
                        colorScheme="purple"
                        bg="#7E30E1"
                        color="#F3F8FF"
                        _hover={{ bg: '#E26EE5' }}
                        isLoading={loading}
                        isDisabled={
                            !passwordValidations.length || 
                            !passwordValidations.hasNumber ||
                            !passwordValidations.hasSpecialChar ||
                            !passwordValidations.hasUppercase ||
                            !passwordValidations.hasLowercase ||
                            loading
                        } // Disable until all conditions are met
                    >
                        Get Premium
                    </Button>
                </Stack>
            </form>
        </Box>
    );
}
