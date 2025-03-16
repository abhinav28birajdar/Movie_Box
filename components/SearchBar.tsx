import { StyleSheet, View ,Image, TextInput} from 'react-native'
import React from 'react'
import { icons } from '@/constants/icons'

interface props {
    placeholder :string;
    onpress?:()=>void;
}
const SearchBar = ({placeholder, onpress}) => {
  return (
        <View className=' flex-row items-center bg-dark-200  rounded-full px-5 py-2'>
            <Image source={icons.search} className ="size-5"resizeMode='contain'tintColor= "#ab8bff"/>
            <TextInput
            onPress={onpress}
                placeholder={placeholder}
          value=''
          onChangeText={()=>{}}
          placeholderTextColor='#a8b5ab'
          className='flex-1 ml-2 text-white'
            />
    </View>
  )
}

export default SearchBar

const styles = StyleSheet.create({})