const axios = require( "axios" );
module.exports = {
    sendOutput,
    askLLaMA,
    randomInt
};

const timeStringOptions = {
    timeZone: 'America/Denver'
};

function sendOutput( msg, send ) {
    if ( msg.length > 20000 ) {
        while ( msg.length > 20000 ) {
            send( msg.slice( 0, 18000 ) );
            msg = msg.slice( 18000, -1 );
        }
    }
    try {
        send( msg );
    } catch ( e ) {
        console.error( e );
    }
}

function askLLaMA( { prompt, tokens, base = (basePrompt + serverAwareness), crazy = false, messageHistoryPrompt }, callback ) {
    let data = {
        messages: [
            {
                content: base,
                role: 'system'
            }
        ],
        n_predict: Number( tokens )
    };

    if ( typeof prompt === 'string' ) {
        data.messages.push(
            {
                content: prompt,
                role: 'user'
            }
        );
    } else if ( Array.isArray( prompt ) ) {
        //prompt is an array of messages, add each individually
        prompt.forEach( msg => {
            if ( msg.isBot ) {
                data.messages.push( {
                    content: msg.content,
                    role: 'assistant'
                } );
            } else {
                data.messages.push( {
                    content: `${ msg.sender } (${ new Date( msg.timestamp ).toLocaleString( 'en-US', timeStringOptions ) }): ${ msg.content }`,
                    role: 'user'
                } );
            }
        } );
        // Add a prompt to get it to output something coherent
        data.messages.push( {
            content: messageHistoryPrompt,
            role: 'user'
        } );
    }

    if ( crazy ) {
        data.top_k = 100;
        data.top_p = .20;
    }
    //console.log( data );
    axios.post( "http://llama.cpp:8000/v1/chat/completions", data ).then( result => {
        callback( result.data.choices[0].message.content );
    } ).catch( err => {
        console.log( err );
    } );
}

function randomInt( low, high ) {
    return Math.floor( Math.random() * (high - low) ) + low;
}
