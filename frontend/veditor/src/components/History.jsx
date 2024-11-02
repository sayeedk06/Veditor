import { useEffect, useState } from "react"
import axios from 'axios';
import Cookies from 'js-cookie';
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    TableCaption,
    TableContainer,
} from '@chakra-ui/react'

export default function History({user}) {

    const [videoList, setVideoList] = useState([])
    console.log("Thisss" ,user)

    useEffect(() => {
        const token = Cookies.get('token')
        const header = { 'Authorization': `Bearer ${token}` }
        axios.get(process.env.REACT_APP_BASE_URL + `video/${user}`, { 
            headers: header,
        })
            .then((response) => {
                return response.data
            }).then((data) => {
                console.log("HERE", data.videoList)
                setVideoList(data.videoList)
            })
    }, [])
    return (
        <TableContainer className="history">
            <Table>
                <TableCaption>Upload History</TableCaption>
                <Thead>
                    <Tr>
                        <Th>File Name</Th>
                        <Th>Last Updated</Th>
                    </Tr>
                </Thead>
                <Tbody>
                {videoList.map((x) => (
                    <Tr>
                        <Th>{x.name}</Th>
                        <Th>{x.lastupdated}</Th>
                    </Tr>   
                )

                )}
                </Tbody>
                
            </Table>
        </TableContainer>
    )
}