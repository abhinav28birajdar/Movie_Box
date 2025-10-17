import { StyleSheet, View ,Image, TextInput, TouchableOpacity} from 'react-native'
import React from 'react'
import { icons } from '@/constants/icons'

interface props {
    placeholder :string;
    onPress?:()=>void;
    value?: string;
    onChangeText?: (text: string) => void;
}
const SearchBar = ({placeholder, onPress, value, onChangeText}: props) => {
  return (
        <View className=' flex-row items-center bg-dark-200  rounded-full px-5 py-2'>
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor='#a8b5ab'
                className='flex-1 ml-2 text-white'
                onSubmitEditing={onPress}
            />
            <TouchableOpacity onPress={onPress}>
                <Image source={icons.search} className ="size-5"resizeMode='contain'tintColor= "#ab8bff"/>
            </TouchableOpacity>
    </View>
  )
}

export default SearchBar

const styles = StyleSheet.create({})