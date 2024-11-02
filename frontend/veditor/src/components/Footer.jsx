import { Box, Text, Link, Flex } from '@chakra-ui/react';

export default function Footer() {
  return (
    <Box
      as="footer"
      width="100%"
      background= "linear-gradient(180deg, #E26EE5 0%, #7E30E1 100%)" // Reverse gradient from pink to purple
      color="white"
      textAlign="center"
      padding="20px"
      position="relative"
      bottom="0"
      //mt="20px" // Add margin on top for spacing
    >
      <Text fontSize="lg" fontWeight="bold" mb="4">
        © 2024 Veditor. All rights reserved.
      </Text>
      <Text fontSize="sm" mb="4">
        Created by:
      </Text>
      <Flex justifyContent="center" wrap="wrap" mb="4">
        <Link href="/privacy" color="white" mr="4">
          N11672005
        </Link>
        <Link href="/terms" color="white" mr="4">
          Sayeed Md Shaiban
        </Link>
        <Link href="/contact" color="white" mr="4">
          N11684763
        </Link>
        <Link href="/privacy" color="white">
          Paulina Luisce Parroquin
        </Link>
      </Flex>
    </Box>
  );
}
