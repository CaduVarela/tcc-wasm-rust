use std::env;
use fibonacci::fibonacci;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() != 2 {
        eprintln!("Usage: fibonacci <n>");
        std::process::exit(1);
    }
    let n: u32 = args[1].parse().expect("n must be a non-negative integer");
    let result = fibonacci(n);
    println!("{}", result);
}
