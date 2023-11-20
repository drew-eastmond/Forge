import asyncio

async def read_stdin():
    while True:
        message = await loop.run_in_executor(None, input, "Enter a message (or 'exit' to quit): ")
        if message == 'exit':
            break
        print(f"Received message: {message}")

loop = asyncio.get_event_loop()
try:
    loop.run_until_complete(read_stdin())
finally:
    loop.close()
