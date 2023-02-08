import { Basket } from "../../app/models/basket"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import agent from "../../app/api/agent";
import { act } from "react-dom/test-utils";

interface BasketState {
    basket: Basket | null;
    status: string;
}

const initialState: BasketState = {
    basket: null,
    status: 'idle'
}

export const addBasketItemASync = createAsyncThunk<Basket, {productId: number, quantity?: number}>(
    'basket/addBasketItemASync',
    async ({productId, quantity = 1}) => {
        try {
            return await agent.Basket.addItem(productId, quantity);
        } catch (error) {
            console.log(error);
        }
    }
)
export const removeBasketItemASync = createAsyncThunk<void, 
{productId: number, quantity: number, name?: string}> (
    'basket/removeBasketItemAsync',
    async ({productId, quantity}) => {
        try {
            await agent.Basket.removeItem(productId, quantity);
        } catch (error) {
            console.log(error);
        }
    }
)

export const basketSlice = createSlice({
    name: 'basket',
    initialState,
    reducers: {
        setBasket: (state, action) => {
            state.basket = action.payload
        }
    },
    extraReducers: (builder => {
        builder.addCase(addBasketItemASync.pending, (state, action) => {
            state.status = 'pendingAddItem' + action.meta.arg.productId;
        });
        builder.addCase(addBasketItemASync.fulfilled, (state, action) => {
            state.basket = action.payload;
            state.status = 'idle'
        });
        builder.addCase(addBasketItemASync.rejected, (state) => {
            state.status = 'idle'
        });
        builder.addCase(removeBasketItemASync.pending, (state, action) => {
            state.status = 'pendingRemoveItem' + action.meta.arg.productId + action.meta.arg.name;
        });
        builder.addCase(removeBasketItemASync.fulfilled, (state, action) => {
            const {productId, quantity} = action.meta.arg;
            const itemIndex = state.basket?.items.findIndex(i => i.productId === productId);
            if (itemIndex == -1 || itemIndex === undefined) return;
            state.basket!.items[itemIndex].quantity -= quantity;
            if (state.basket?.items[itemIndex].quantity === 0) 
                state.basket.items.splice(itemIndex, 1);
            state.status = 'idle';
        });
        builder.addCase(removeBasketItemASync.rejected, (state) => {
            state.status = 'idle';
        })
    })
})

export const {setBasket} = basketSlice.actions;