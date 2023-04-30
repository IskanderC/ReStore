import { Basket } from "../../app/models/basket"
import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit"
import agent from "../../app/api/agent";
import { getCookie } from "../../app/util/util";

interface BasketState {
    basket: Basket | null;
    status: string;
}

const initialState: BasketState = {
    basket: null,
    status: 'idle'
}

export const fetchBasketAsync = createAsyncThunk<Basket>(
    'basket/fetchBasketAsync',
    async (_, thunkAPI) => {
        try {
            return await agent.Basket.get();
        } catch (error: any) {
            return thunkAPI.rejectWithValue({error: error.data})
        }
    },
    {
        condition: () => {
            if (!getCookie('buyerId')) return false;
        }
    }
)

export const addBasketItemASync = createAsyncThunk<Basket, {productId: number, quantity?: number}>(
    'basket/addBasketItemASync',
    async ({productId, quantity = 1}, thunkAPI) => {
        try {
            return await agent.Basket.addItem(productId, quantity);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({error: error.data})
        }
    }
)
export const removeBasketItemASync = createAsyncThunk<void, 
{productId: number, quantity: number, name?: string}> (
    'basket/removeBasketItemAsync',
    async ({productId, quantity}, thunkAPI) => {
        try {
            await agent.Basket.removeItem(productId, quantity);
        } catch (error: any) {
            return thunkAPI.rejectWithValue({error: error.data})
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
        builder.addCase(removeBasketItemASync.pending, (state, action) => {
            state.status = 'pendingRemoveItem' + action.meta.arg.productId + action.meta.arg.name;
        });
        builder.addCase(removeBasketItemASync.fulfilled, (state, action) => {
            const {productId, quantity} = action.meta.arg;
            const itemIndex = state.basket?.items.findIndex(i => i.productId === productId);
            if (itemIndex === -1 || itemIndex === undefined) return;
            state.basket!.items[itemIndex].quantity -= quantity;
            if (state.basket?.items[itemIndex].quantity === 0) 
                state.basket.items.splice(itemIndex, 1);
            state.status = 'idle';
        });
        builder.addCase(removeBasketItemASync.rejected, (state, action) => {
            state.status = 'idle';
            console.log(action.payload);
        });
        builder.addMatcher(isAnyOf(addBasketItemASync.fulfilled, fetchBasketAsync.fulfilled), (state, action) => {
            state.basket = action.payload;
            state.status = 'idle';
        });
        builder.addMatcher(isAnyOf(addBasketItemASync.rejected, fetchBasketAsync.rejected), (state, action) => {
            state.status = 'idle'
            console.log(action.payload);
        });
    })
})

export const {setBasket} = basketSlice.actions;