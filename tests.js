"use strict"

let assert = require( 'assert' ),
    MemoryHelper = require( './index.js' )

describe( 'MemoryHelper', ()=> {

  it( 'should allocate memory in constructor', ()=> {
    let memsize = 512,
        helper = MemoryHelper.create( memsize ),
        answer = memsize,
        result = helper.heap.length

    assert.equal( result, answer )
  })

  it( 'should return an index of 0 for first allocation', ()=> {
    let helper = MemoryHelper.create(), // defaults to 64 blocks
        answer = 0,
        result = helper.alloc( 32 ) // should point to 0

    assert.equal( result, answer )
  })

  it( 'should not return an index of 0 for second allocation', ()=> {
    let helper = MemoryHelper.create(), // defaults to 1024 blocks
        answer = 0,
        firstBlockIndex, secondBlockIndex, result

    firstBlockIndex  = helper.alloc( 32 )
    secondBlockIndex = helper.alloc( 32 )
    result = secondBlockIndex

    assert.notEqual( result, answer )
  })

  it( 'should maintain a free list', ()=> {
    let helper = MemoryHelper.create(), // defaults to 1024 blocks
        answer = { 0:32, 32:32 },
        result

    helper.alloc( 32 )
    helper.alloc( 32 )
    result = helper.list

    assert.deepEqual( result, answer )
  })

  it( 'should remove blocks from free list on calls to free()', ()=> {
    let helper = MemoryHelper.create(),
        answer = { 0:32, 32:0, 64:32 }, // second block is freed
        blockToBeFreedIndex, result

    helper.alloc( 32 )
    blockToBeFreedIndex = helper.alloc( 32 )
    helper.alloc( 32 )

    helper.free( blockToBeFreedIndex )

    result = helper.list

    assert.deepEqual( result, answer )
  })

  it( 'should throw an error if a non-existing block is freed', ()=> {
    let helper = MemoryHelper.create()

    assert.throws( ()=> { helper.free( 32 ) } )
  })

  it( 'should throw an error if more memory is alloced than the helper can provide  ', ()=> {
    let helper = MemoryHelper.create( 16 ) // only request 16 blocks

    assert.throws( ()=> { helper.alloc( 32 ) } ) // try to request 32 blocks
  })

  it( 'should throw an error if too much memory is alloced', ()=> {
    let helper = MemoryHelper.create( 16 ) // only request 16 blocks

    helper.alloc( 12 )

    assert.throws( ()=> { helper.alloc( 12 ) } ) // over limit, but not more than the max size
  })

})
