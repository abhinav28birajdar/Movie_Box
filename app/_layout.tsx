import { Stack } from "expo-router";
import "@/global.css"
export default function Layout() {
  return(
   <Stack>
    <Stack.Screen 
    name="(tabs)"
    options={{
      headerShown:false}}
    />
        <Stack.Screen 
    name="movie/[id]"
    options={{
      headerShown:false}}
    />
  </Stack>
  )
}