import { useParams } from 'react-router-dom'
import WarehouseFormPage from './WarehouseFormPage'

const Page = () => {
  const { id } = useParams()
  return <WarehouseFormPage id={id} />
}

export default Page

