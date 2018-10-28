require 'net/http'
require 'json'

class Client

  @@api_host = "https://damp-plains-53744.herokuapp.com/api/getPopulationData/"
  ##@@api_host = "http://localhost:5000/api/getPopulationData/"  ## Local Testing

  def get_zip
    print "Enter desired zip code (Enter -1 to quit) >> "
    zip_code = ""
    zip_code = gets.chomp
    return zip_code
  end

  def get_API_data(zip_code)
    url = @@api_host + '?zipCode=' + zip_code.to_s
    uri = URI(url)
    begin
      response = Net::HTTP.get_response(uri)
      return response
    rescue
      puts "Couldn't connect to API!\nPlease check your connection and try again."
      exit(1)
    end

  end

  def show_pop_data(pop_data_res, zip_code)
    if pop_data_res.code == '200'
    else
      puts "Error: Data could not be retrieved due to server error or bad connection. Please check connection and try again."
      exit(1)
    end

    pop_json_data = JSON.parse(pop_data_res.body)

    if pop_json_data[0]["CBSA"] == "99999"
      print "\nCBSA: 99999 - invalid, returning.\n\n"
      return
    end

    if pop_json_data[0]["CBSA"] == nil
      print "\nBad Zip Code or Not Found. Please try a different Zip Code.\n"
      return
    end

    puts "\n<==\t\tDATA\t\t==>\n"
    pop_json_data.each do |res|
      zip = res["Zip"]
      cbsa = res.key?("CBSA") ? ["CBSA"] : "No CBSA Found"
      msa = res.key?("MSA") ? res["MSA"] : 'N/A'
      pop_2015 = res.key?("Pop2015") ? res["Pop2015"] : 'N/A'
      pop_2014 = res.key?("Pop2014") ? res["Pop2014"] : 'N/A'

      puts "| \t Data for " + zip_code
      puts "| ZIP:\t\t" + zip
      puts "| CBSA:\t\t" + res["CBSA"]
      puts "| MSA:\t\t" + msa
      puts "| Pop 2015:\t" + pop_2015.to_s
      puts "| Pop 2014:\t" + pop_2014.to_s
      puts "|\t\t\t\t "
      puts "<==\t\t\t\t==>"

      if pop_2015.to_i > pop_2014.to_i
       growth_percent = ((pop_2015.to_i - pop_2014.to_i).to_f / pop_2014.to_i) * 100
       puts "\nPopulation Growth:\t\t" + '%.2f' % growth_percent + "%\n\n"
      elsif pop_2015.to_i < pop_2014.to_i
        growth_percent = ((pop_2015.to_i - pop_2014.to_i).to_f / pop_2014.to_i) * 100
        puts "\nPopulation Loss:\t\t" + '%.2f' % growth_percent + "%\n\n"
      end
    end
  end
end

while(true)

  client = Client.new
  zip_code = client.get_zip

  if zip_code == "-1"
    puts "Thanks for using this program! Have a great day."
    exit(1)
  end

  if zip_code.length != 5
    puts "Please input a 5 digit zip code."
  else
    pop_data_res = client.get_API_data(zip_code)
    client.show_pop_data(pop_data_res, zip_code)
  end


end
