#memory-helper

This simple utility class is designed to help manage memory stored in JavaScript `TypedArrays`.
It provides memory addresses (indices) based on past and present requests for arbitrary
blocks of memory; these memory locations can subsequently be freed for reuse. The class
throws errors if there is not a block of sufficient size remaining; however, it will not
prevent developers from writing into adjacent blocks (or, for that matter, any arbitrary indices of their choice). For a solution with much more robust error handling / write protection see: https://github.com/codemix/malloc

The allocation scheme is an approximation of ["first-fit"](http://www.memorymanagement.org/mmref/alloc.html#mmref-alloc-first-fit). Other schemes
may be explored in the future. This utility class was created to provide memory management for [genish.js](http://www.charlie-roberts.com/genish), an audio synthesis library.

##Example
```javascript
// manage two minutes of stereo audio at 44.1 khz
let helper = MemoryHelper.create( 44100 * 60 * 2 )

// request index to store 1024 samples
let blockSize = 1024,
    idx = helper.alloc( blockSize )

// write noise to memory using index obtained through .alloc()
for( let i = idx; i < idx + blockSize; i++ ) {
  helper.heap[ i ] = Math.random()
}

// free block after use
helper.free( idx )
```

##API
The index.js file exports a factory object, `MemoryHelper`.

### Methods
####.create( *numberOfElements*, *arrayType* )
Each `MemoryHelper` instance contains a single JavaScript `TypedArray`, with an arbitrary number of elements.
By default, the element type is `Float32Array` and the length of the array is `4096`. To create a helper managing
an array of sixteen 16-bit integers:

```javascript
let helper = MemoryHelper.create( 16, Int16Array )
```

####.alloc( *sizeOfMemoryRequest* )
Reserve a block of memory and obtain a starting integer index for reading / writing to the block. An error is thrown if insufficient memory is remaining for the allocation request.

####.free( *blockIndex* )
Free a block beginning at the index *blockIndex*; this index should have been previously obtained from a call to `.alloc()`. An error is thrown if a *blockIndex* is passed that does not have a block index associated with it.

### Properties
####.heap
The `.heap` property represents the `TypedArray` instantiated during a call to `MemoryHelper.create()`. You can freely
read / write to this array; however, the point of the `MemoryHelper` utility class is to do so using indices obtained from calls to the `.malloc()` method.

## Development and Testing
There's nothing fancy in regards to development... no build script required. For testing simply run `npm test` (after installing all necessary packages via `npm install`). Tests use mocha and vanilla assert.
